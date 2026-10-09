/** Popula o banco com usuários, posts e likes de exemplo. Uso: java -cp ... Seed */
public class Seed {
    public static void main(String[] args) throws Exception {
        System.out.println("Populando o banco de dados...");
        Db.init();
        Db.query("TRUNCATE TABLE users, posts, likes, tokens_blacklist RESTART IDENTITY CASCADE");

        String[][] users = {
                {"Mairon Lima", "maironlmelo@gmail.com", "password123"},
                {"Maria Eduarda", "mariaeduarda@example.com", "password123"},
                {"Rafael Borges", "rafaelborges@example.com", "password123"},
        };
        int[] ids = new int[users.length];
        for (int i = 0; i < users.length; i++) {
            ids[i] = (Integer) Db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?) RETURNING id",
                    (Object[]) users[i]).get(0).get("id");
        }
        System.out.println(ids.length + " usuários criados.");

        Object[][] posts = {
                {"Filme do final de semana", "Assisti um filme de suspense ontem e o final me pegou completamente de surpresa.", null, ids[1]},
                {"Café da manhã perfeito", "Pão quentinho, café e frutas fazem qualquer manhã começar melhor.", null, ids[2]},
                {"Vontade de viajar", "Tenho muita vontade de conhecer o Japão algum dia.", null, ids[0]},
                {"Treino concluido", "Hoje consegui bater meu recorde na academia. Pequenos avanços importam.", null, ids[2]},
                {"Música favorita da semana", "Descobri uma banda nova e não consigo parar de ouvir as músicas deles.", null, ids[1]},
                {"Chuva boa", "A melhor sensação é ouvir chuva forte enquanto descanso em casa.", null, ids[0]},
                {"Fim de tarde na praia", "Nada melhor do que assistir o por do sol depois de um dia cansativo.", null, ids[0]},
                {"Teste contas já existentes também!", """
                        login: maironlmelo@gmail.com | senha: password123
                        login: mariaeduarda@example.com | senha: password123
                        login: rafaelborges@example.com | senha: password123""", null, ids[0]},
                {"Espero que goste!", "Obrigado pela atenção.", "Gemini_Generated_Image_4f4fld4f4fld4f4f.png", ids[0]},
        };
        for (Object[] p : posts) {
            Db.query("INSERT INTO posts (title, content, image, \"authorId\") VALUES (?, ?, ?, ?)", p);
        }
        System.out.println(posts.length + " posts criados.");

        var postIds = Db.query("SELECT id FROM posts");
        for (int i = 0; i < postIds.size(); i++) {
            Object postId = postIds.get(i).get("id");
            if (i % 2 == 0) Db.query("INSERT INTO likes (\"postId\", \"userId\") VALUES (?, ?)", postId, ids[0]);
            if (i % 3 == 0) Db.query("INSERT INTO likes (\"postId\", \"userId\") VALUES (?, ?)", postId, ids[1]);
        }
        System.out.println("Banco de dados populado com sucesso!");
    }
}
