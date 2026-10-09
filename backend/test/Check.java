import java.util.List;
import java.util.Map;

/** Checagem rápida de Json e Jwt. Uso: java -ea -cp out Check */
public class Check {
    public static void main(String[] args) {
        Object v = Json.parse(" {\"a\": [1, -2.5, true, null], \"s\": \"x\\\"\n\u00e9\"} ");
        assert v.equals(Map.of("a", java.util.Arrays.asList(1L, -2.5, true, null), "s", "x\"\né")) : v;
        assert Json.write(Main.map("s", "a\"b\n", "n", 3, "l", List.of(), "z", null)).equals("{\"s\":\"a\\\"b\\n\",\"n\":3,\"l\":[],\"z\":null}");
        for (String bad : new String[]{"", "{", "{\"a\":}", "[1,]", "tru", "{} x"}) {
            try { Json.parse(bad); assert false : bad; } catch (IllegalArgumentException expected) {}
        }

        String token = Jwt.sign(Main.map("sub", "1", "exp", 4102444800L), "k");
        assert "1".equals(Jwt.verify(token, "k").get("sub"));
        assert Jwt.verify(token, "outra") == null;
        assert Jwt.verify(token + "x", "k") == null;
        assert Jwt.verify(Jwt.sign(Main.map("sub", "1", "exp", 1L), "k"), "k") == null : "expirado";
        assert Jwt.verify("lixo", "k") == null;
        System.out.println("ok");
    }
}
