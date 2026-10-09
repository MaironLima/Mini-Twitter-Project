import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Parser/serializador JSON mínimo (objetos, arrays, strings, números, booleanos e null). */
final class Json {
    private final String s;
    private int i;

    private Json(String s) {
        this.s = s;
    }

    /** Lança IllegalArgumentException se o texto não for JSON válido. */
    static Object parse(String text) {
        var p = new Json(text);
        try {
            p.ws();
            Object v = p.value();
            p.ws();
            if (p.i != text.length()) throw p.err();
            return v;
        } catch (IndexOutOfBoundsException e) {
            throw p.err();
        }
    }

    static String write(Object v) {
        var b = new StringBuilder();
        write(b, v);
        return b.toString();
    }

    private static void write(StringBuilder b, Object v) {
        switch (v) {
            case null -> b.append("null");
            case Number n -> b.append(n);
            case Boolean x -> b.append(x);
            case Map<?, ?> m -> {
                b.append('{');
                boolean first = true;
                for (var e : m.entrySet()) {
                    if (!first) b.append(',');
                    first = false;
                    quote(b, String.valueOf(e.getKey()));
                    b.append(':');
                    write(b, e.getValue());
                }
                b.append('}');
            }
            case Collection<?> list -> {
                b.append('[');
                boolean first = true;
                for (Object o : list) {
                    if (!first) b.append(',');
                    first = false;
                    write(b, o);
                }
                b.append(']');
            }
            default -> quote(b, v.toString());
        }
    }

    private static void quote(StringBuilder b, String str) {
        b.append('"');
        for (int k = 0; k < str.length(); k++) {
            char c = str.charAt(k);
            switch (c) {
                case '"' -> b.append("\\\"");
                case '\\' -> b.append("\\\\");
                case '\n' -> b.append("\\n");
                case '\r' -> b.append("\\r");
                case '\t' -> b.append("\\t");
                default -> {
                    if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
                    else b.append(c);
                }
            }
        }
        b.append('"');
    }

    private Object value() {
        return switch (s.charAt(i)) {
            case '{' -> object();
            case '[' -> array();
            case '"' -> string();
            case 't' -> literal("true", true);
            case 'f' -> literal("false", false);
            case 'n' -> literal("null", null);
            default -> number();
        };
    }

    private Map<String, Object> object() {
        var m = new LinkedHashMap<String, Object>();
        i++;
        ws();
        if (s.charAt(i) == '}') {
            i++;
            return m;
        }
        while (true) {
            ws();
            String key = string();
            ws();
            expect(':');
            ws();
            m.put(key, value());
            ws();
            if (s.charAt(i) == ',') {
                i++;
                continue;
            }
            expect('}');
            return m;
        }
    }

    private List<Object> array() {
        var list = new ArrayList<>();
        i++;
        ws();
        if (s.charAt(i) == ']') {
            i++;
            return list;
        }
        while (true) {
            ws();
            list.add(value());
            ws();
            if (s.charAt(i) == ',') {
                i++;
                continue;
            }
            expect(']');
            return list;
        }
    }

    private String string() {
        expect('"');
        var b = new StringBuilder();
        while (true) {
            char c = s.charAt(i++);
            if (c == '"') return b.toString();
            if (c != '\\') {
                b.append(c);
                continue;
            }
            char e = s.charAt(i++);
            switch (e) {
                case '"', '\\', '/' -> b.append(e);
                case 'n' -> b.append('\n');
                case 'r' -> b.append('\r');
                case 't' -> b.append('\t');
                case 'b' -> b.append('\b');
                case 'f' -> b.append('\f');
                case 'u' -> {
                    b.append((char) Integer.parseInt(s.substring(i, i + 4), 16));
                    i += 4;
                }
                default -> throw err();
            }
        }
    }

    private Object number() {
        int start = i;
        while (i < s.length() && "+-0123456789.eE".indexOf(s.charAt(i)) >= 0) i++;
        String n = s.substring(start, i);
        if (n.isEmpty()) throw err();
        return n.matches("-?\\d+") ? (Object) Long.parseLong(n) : (Object) Double.parseDouble(n);
    }

    private Object literal(String word, Object v) {
        if (!s.startsWith(word, i)) throw err();
        i += word.length();
        return v;
    }

    private void expect(char c) {
        if (s.charAt(i++) != c) throw err();
    }

    private void ws() {
        while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++;
    }

    private IllegalArgumentException err() {
        return new IllegalArgumentException("JSON inválido na posição " + i);
    }
}
