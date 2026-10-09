import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

import static java.nio.charset.StandardCharsets.UTF_8;

/** API do Mini Twitter em Java puro: com.sun.net.httpserver + JDBC. */
public class Main {
    static final String SECRET = System.getenv().getOrDefault("JWT_SECRET", "super-secret-key");
    static final int PORT = Integer.parseInt(System.getenv().getOrDefault("PORT", "3000"));
    static final int PAGE_SIZE = 10;
    static final int MAX_IMAGE = 5 * 1024 * 1024;
    static final int MAX_BODY = 10 * 1024 * 1024;
    static final int RATE_LIMIT = Integer.parseInt(System.getenv().getOrDefault("RATE_LIMIT", "10")); // req/min por IP
    static final long TOKEN_TTL = 7 * 24 * 3600;
    static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    static final Pattern POST_ID = Pattern.compile("^/posts/(\\d{1,9})(/like)?$");
    static final Map<String, long[]> HITS = new ConcurrentHashMap<>();

    record Res(int status, Object body) {}

    @SuppressWarnings("serial")
    static class HttpError extends RuntimeException {
        final transient Res res;

        HttpError(int status, Object body) {
            super(null, null, false, false);
            res = new Res(status, body);
        }
    }

    public static void main(String[] args) throws Exception {
        Db.init();
        var server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", Main::handle);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();
        System.out.println("Mini Twitter API rodando na porta " + PORT);
    }

    static void handle(HttpExchange ex) throws IOException {
        try (ex) {
            cors(ex);
            if (ex.getRequestMethod().equals("OPTIONS")) {
                ex.sendResponseHeaders(204, -1);
                return;
            }
            Res res;
            try {
                rateLimit(ex);
                res = route(ex);
            } catch (HttpError e) {
                res = e.res;
            } catch (Exception e) {
                e.printStackTrace();
                res = new Res(500, Map.of("error", "Erro interno do servidor", "message", "Ocorreu um problema inesperado."));
            }
            byte[] out = Json.write(res.body()).getBytes(UTF_8);
            ex.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
            ex.sendResponseHeaders(res.status(), out.length);
            ex.getResponseBody().write(out);
        }
    }

    static Res route(HttpExchange ex) throws Exception {
        String method = ex.getRequestMethod();
        String path = ex.getRequestURI().getPath();
        if (path.length() > 1 && path.endsWith("/")) path = path.substring(0, path.length() - 1);

        switch (method + " " + path) {
            case "POST /auth/register" -> { return register(body(ex)); }
            case "POST /auth/login" -> { return login(body(ex)); }
            case "POST /auth/logout" -> { return logout(ex); }
            case "GET /posts" -> { return listPosts(query(ex)); }
            case "POST /posts" -> { return createPost(auth(ex), body(ex)); }
            default -> {}
        }

        var m = POST_ID.matcher(path);
        if (m.matches()) {
            int id = Integer.parseInt(m.group(1));
            boolean like = m.group(2) != null;
            if (like && method.equals("POST")) return toggleLike(auth(ex), id);
            if (!like && method.equals("PUT")) return updatePost(auth(ex), id, body(ex));
            if (!like && method.equals("DELETE")) return deletePost(auth(ex), id);
        }
        throw error(404, "Recurso não encontrado");
    }

    // --- Auth ---

    static Res register(Map<String, Object> b) throws SQLException {
        String name = text(b, "name", 2), email = email(b), password = text(b, "password", 4);
        try {
            var user = Db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?) RETURNING id, name, email", name, email, password);
            return new Res(201, user.get(0));
        } catch (SQLException e) {
            throw error(400, "Usuário já cadastrado ou dados inválidos");
        }
    }

    static Res login(Map<String, Object> b) throws SQLException {
        String email = email(b), password = text(b, "password", 0);
        // ponytail: senha em texto puro como no backend original; migrar para hash (PBKDF2) exige re-cadastro/migração dos usuários
        var rows = Db.query("SELECT id, name, email FROM users WHERE email = ? AND password = ?", email, password);
        if (rows.isEmpty()) throw error(401, "Credenciais inválidas");
        var user = rows.get(0);
        String token = Jwt.sign(map(
                "sub", user.get("id").toString(),
                "name", user.get("name"),
                "exp", Instant.now().getEpochSecond() + TOKEN_TTL), SECRET);
        return ok(map("token", token, "user", user));
    }

    static Res logout(HttpExchange ex) throws SQLException {
        String token = bearer(ex);
        if (token == null) throw error(401, "Não autorizado");
        var payload = Jwt.verify(token, SECRET);
        if (payload != null && payload.get("exp") instanceof Number exp) {
            Db.query("INSERT INTO tokens_blacklist (token, \"expiresAt\") VALUES (?, ?) ON CONFLICT DO NOTHING",
                    token, LocalDateTime.ofEpochSecond(exp.longValue(), 0, ZoneOffset.UTC));
        }
        return ok(map("success", true, "message", "Logout realizado com sucesso. Token invalidado."));
    }

    /** Valida o Bearer token e retorna o id do usuário. */
    static int auth(HttpExchange ex) throws SQLException {
        String token = bearer(ex);
        if (token == null) throw error(401, "Não autorizado: Token não fornecido");
        if (!Db.query("SELECT id FROM tokens_blacklist WHERE token = ?", token).isEmpty())
            throw error(401, "Não autorizado: Este token foi invalidado (logout realizado)");
        var payload = Jwt.verify(token, SECRET);
        try {
            if (payload != null) return Integer.parseInt(String.valueOf(payload.get("sub")));
        } catch (NumberFormatException ignored) {
        }
        throw error(401, "Não autorizado: Token inválido ou expirado");
    }

    static String bearer(HttpExchange ex) {
        String h = ex.getRequestHeaders().getFirst("Authorization");
        if (h == null) return null;
        String[] parts = h.split(" ");
        return parts.length > 1 ? parts[1] : null;
    }

    // --- Posts ---

    static Res listPosts(Map<String, String> q) throws SQLException {
        int page;
        try {
            page = Math.max(1, Integer.parseInt(q.getOrDefault("page", "1")));
        } catch (NumberFormatException e) {
            page = 1;
        }
        String search = q.get("search");
        boolean filter = search != null && !search.isEmpty();
        String where = filter ? " WHERE p.title ILIKE ?" : "";
        var args = new ArrayList<Object>();
        if (filter) args.add("%" + search + "%");

        long total = (Long) Db.query("SELECT COUNT(*) AS total FROM posts p" + where, args.toArray()).get(0).get("total");
        args.add(PAGE_SIZE);
        args.add((page - 1) * PAGE_SIZE);
        var posts = Db.query("""
                SELECT p.*, u.name AS "authorName",
                  (SELECT COUNT(*) FROM likes WHERE "postId" = p.id) AS "likesCount"
                FROM posts p JOIN users u ON p."authorId" = u.id""" + where + " ORDER BY p.\"createdAt\" DESC LIMIT ? OFFSET ?",
                args.toArray());
        return ok(map("posts", posts, "total", total, "page", page, "limit", PAGE_SIZE));
    }

    static Res createPost(int userId, Map<String, Object> b) throws SQLException {
        String title = text(b, "title", 3), content = text(b, "content", 1), image = image(b);
        return ok(Db.query("INSERT INTO posts (title, content, \"authorId\", image) VALUES (?, ?, ?, ?) RETURNING *",
                title, content, userId, image).get(0));
    }

    static Res updatePost(int userId, int id, Map<String, Object> b) throws SQLException {
        requireAuthor(id, userId);
        String title = text(b, "title", 3), content = text(b, "content", 1), image = image(b);
        Db.query("UPDATE posts SET title = ?, content = ?, image = ? WHERE id = ?", title, content, image, id);
        return ok(map("success", true));
    }

    static Res deletePost(int userId, int id) throws SQLException {
        requireAuthor(id, userId);
        Db.query("DELETE FROM posts WHERE id = ?", id);
        return ok(map("success", true));
    }

    static Res toggleLike(int userId, int id) throws SQLException {
        if (Db.query("SELECT id FROM posts WHERE id = ?", id).isEmpty()) throw error(404, "Post não encontrado");
        if (!Db.query("DELETE FROM likes WHERE \"postId\" = ? AND \"userId\" = ? RETURNING id", id, userId).isEmpty())
            return ok(map("liked", false));
        Db.query("INSERT INTO likes (\"postId\", \"userId\") VALUES (?, ?) ON CONFLICT DO NOTHING", id, userId);
        return ok(map("liked", true));
    }

    static void requireAuthor(int postId, int userId) throws SQLException {
        var rows = Db.query("SELECT \"authorId\" FROM posts WHERE id = ?", postId);
        if (rows.isEmpty()) throw error(404, "Post não encontrado");
        if (!rows.get(0).get("authorId").equals(userId)) throw error(403, "Acesso negado: Você não é o autor deste post");
    }

    // --- Validação e utilitários HTTP ---

    static String text(Map<String, Object> b, String field, int minLength) {
        if (!(b.get(field) instanceof String s)) throw invalid(field, "O campo " + field + " é obrigatório");
        if (s.length() < minLength) throw invalid(field, "O campo " + field + " deve ter no mínimo " + minLength + " caracteres");
        return s;
    }

    static String email(Map<String, Object> b) {
        String email = text(b, "email", 0);
        if (!EMAIL.matcher(email).matches()) throw invalid("email", "E-mail inválido");
        return email;
    }

    static String image(Map<String, Object> b) {
        Object v = b.get("image");
        if (v == null) return null;
        if (!(v instanceof String s)) throw invalid("image", "O campo image deve ser texto");
        if (s.length() > MAX_IMAGE) throw error(400, "Imagem muito grande: Limite de 5MB");
        return s;
    }

    static Map<String, Object> body(HttpExchange ex) throws IOException {
        byte[] raw = ex.getRequestBody().readNBytes(MAX_BODY + 1);
        if (raw.length > MAX_BODY) throw error(413, "Corpo da requisição muito grande");
        try {
            if (Json.parse(new String(raw, UTF_8)) instanceof Map<?, ?> m) {
                @SuppressWarnings("unchecked") var body = (Map<String, Object>) m;
                return body;
            }
        } catch (IllegalArgumentException ignored) {
        }
        throw invalid("body", "JSON inválido");
    }

    static Map<String, String> query(HttpExchange ex) {
        var q = new HashMap<String, String>();
        String raw = ex.getRequestURI().getRawQuery();
        if (raw == null) return q;
        try {
            for (String kv : raw.split("&")) {
                int i = kv.indexOf('=');
                q.putIfAbsent(URLDecoder.decode(i < 0 ? kv : kv.substring(0, i), UTF_8),
                        i < 0 ? "" : URLDecoder.decode(kv.substring(i + 1), UTF_8));
            }
        } catch (IllegalArgumentException e) {
            throw invalid("query", "Query string inválida");
        }
        return q;
    }

    static void cors(HttpExchange ex) {
        var h = ex.getResponseHeaders();
        String origin = ex.getRequestHeaders().getFirst("Origin");
        h.set("Access-Control-Allow-Origin", origin != null ? origin : "*");
        h.set("Vary", "Origin");
        h.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        h.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    // ponytail: janela fixa de 1 min em memória; perde estado ao reiniciar e não é compartilhado entre réplicas
    static void rateLimit(HttpExchange ex) {
        InetAddress remote = ex.getRemoteAddress().getAddress();
        String forwarded = ex.getRequestHeaders().getFirst("X-Forwarded-For");
        // X-Forwarded-For só é confiável quando a requisição vem de um proxy local (Caddy/Nginx/rede Docker)
        boolean viaProxy = forwarded != null && (remote.isLoopbackAddress() || remote.isSiteLocalAddress());
        String ip = viaProxy ? forwarded.split(",")[0].trim() : remote.getHostAddress();
        long window = System.currentTimeMillis() / 60_000;
        if (HITS.size() > 10_000) HITS.values().removeIf(v -> v[0] != window);
        long[] hits = HITS.compute(ip, (k, v) -> v == null || v[0] != window ? new long[]{window, 1} : new long[]{window, v[1] + 1});
        if (hits[1] > RATE_LIMIT) throw error(429, "rate-limit reached");
    }

    static Res ok(Object body) {
        return new Res(200, body);
    }

    static HttpError error(int status, String message) {
        return new HttpError(status, map("error", message));
    }

    static HttpError invalid(String field, String message) {
        return new HttpError(400, map(
                "error", "Erro de validação",
                "message", "Os dados enviados são inválidos ou estão incompletos.",
                "details", List.of(map("field", field, "message", message))));
    }

    /** Map ordenado a partir de pares chave/valor (aceita null, diferente de Map.of). */
    static Map<String, Object> map(Object... kv) {
        var m = new LinkedHashMap<String, Object>();
        for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }
}
