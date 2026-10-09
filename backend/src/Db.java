import java.net.URI;
import java.net.URLDecoder;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;

/** Acesso ao Postgres via JDBC. Lê DATABASE_URL no formato postgres://user:senha@host:porta/banco. */
final class Db {
    private static final DateTimeFormatter ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    private static final String URL, USER, PASSWORD;

    static {
        var uri = URI.create(System.getenv().getOrDefault("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres"));
        String[] cred = uri.getRawUserInfo().split(":", 2);
        URL = "jdbc:postgresql://" + uri.getHost() + ":" + (uri.getPort() == -1 ? 5432 : uri.getPort()) + uri.getRawPath();
        USER = URLDecoder.decode(cred[0], UTF_8);
        PASSWORD = cred.length > 1 ? URLDecoder.decode(cred[1], UTF_8) : "";
    }

    // ponytail: uma conexão por query, sem pool; adicionar pool se o tráfego crescer
    static Connection connect() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    /** Executa SQL parametrizado (?); retorna as linhas se houver ResultSet, senão lista vazia. */
    static List<Map<String, Object>> query(String sql, Object... params) throws SQLException {
        try (var c = connect(); var st = c.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) st.setObject(i + 1, params[i]);
            var rows = new ArrayList<Map<String, Object>>();
            if (!st.execute()) return rows;
            try (var rs = st.getResultSet()) {
                var meta = rs.getMetaData();
                while (rs.next()) {
                    var row = new LinkedHashMap<String, Object>();
                    for (int i = 1; i <= meta.getColumnCount(); i++) {
                        Object v = rs.getObject(i);
                        row.put(meta.getColumnLabel(i), v instanceof Timestamp t ? ISO.format(t.toLocalDateTime()) : v);
                    }
                    rows.add(row);
                }
            }
            return rows;
        }
    }

    static void init() throws SQLException {
        try (var c = connect(); var st = c.createStatement()) {
            st.execute("""
                CREATE TABLE IF NOT EXISTS users (
                  id SERIAL PRIMARY KEY,
                  name TEXT NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  password TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS posts (
                  id SERIAL PRIMARY KEY,
                  title TEXT NOT NULL,
                  content TEXT NOT NULL,
                  image TEXT,
                  "authorId" INTEGER NOT NULL,
                  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE CASCADE
                );
                CREATE TABLE IF NOT EXISTS likes (
                  id SERIAL PRIMARY KEY,
                  "postId" INTEGER NOT NULL,
                  "userId" INTEGER NOT NULL,
                  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE("postId", "userId"),
                  FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE CASCADE,
                  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
                );
                CREATE TABLE IF NOT EXISTS tokens_blacklist (
                  id SERIAL PRIMARY KEY,
                  token TEXT UNIQUE NOT NULL,
                  "expiresAt" TIMESTAMP NOT NULL,
                  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """);
        }
    }
}
