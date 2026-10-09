import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import static java.nio.charset.StandardCharsets.UTF_8;

/** JWT HS256 com a stdlib. */
final class Jwt {
    private static final Base64.Encoder ENC = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DEC = Base64.getUrlDecoder();
    private static final String HEADER = ENC.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(UTF_8));

    static String sign(Map<String, Object> payload, String secret) {
        String data = HEADER + "." + ENC.encodeToString(Json.write(payload).getBytes(UTF_8));
        return data + "." + ENC.encodeToString(hmac(data, secret));
    }

    /** Retorna o payload se a assinatura e o exp forem válidos; senão null. */
    @SuppressWarnings("unchecked")
    static Map<String, Object> verify(String token, String secret) {
        String[] p = token.split("\\.");
        if (p.length != 3) return null;
        try {
            if (!MessageDigest.isEqual(hmac(p[0] + "." + p[1], secret), DEC.decode(p[2]))) return null;
            if (!(Json.parse(new String(DEC.decode(p[1]), UTF_8)) instanceof Map<?, ?> payload)) return null;
            if (payload.get("exp") instanceof Number exp && exp.longValue() < Instant.now().getEpochSecond()) return null;
            return (Map<String, Object>) payload;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static byte[] hmac(String data, String secret) {
        try {
            var mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(UTF_8), "HmacSHA256"));
            return mac.doFinal(data.getBytes(UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }
}
