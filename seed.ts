import { db, initDb } from "./src/db";

async function main() {
  console.log("?? Populando o banco de dados...");

  await initDb();

  // Limpar dados existentes
  await db.query("TRUNCATE TABLE users, posts, likes, tokens_blacklist RESTART IDENTITY CASCADE;");

  // Criar usu�rios
  const users = [
    {
      name: "Mairon Lima",
      email: "maironlmelo@gmail.com",
      password: "password123",
    },
    {
      name: "Maria Eduarda",
      email: "mariaeduarda@example.com",
      password: "password123",
    },
    {
      name: "Rafael Borges",
      email: "rafaelborges@example.com",
      password: "password123",
    },
  ];

  const userIds: number[] = [];
  for (const u of users) {
    const res = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [u.name, u.email, u.password]
    );
    userIds.push(res.rows[0].id);
  }

  console.log(`? ${userIds.length} usuários criados.`);

  // Criar posts
  const posts = [
    {
      title: "Filme do final de semana",
      content:
      "Assisti um filme de suspense ontem e o final me pegou completamente de surpresa.",
      authorId: userIds[1],
    },
    {
      title: "Café da manhã perfeito",
      content:
      "Pão quentinho, cafée frutas fazem qualquer manhã começar melhor.",
      authorId: userIds[2],
    },
    {
      title: "Vontade de viajar",
      content: "Tenho muita vontade de conhecer o Japão algum dia.",
      authorId: userIds[0],
    },
    {
      title: "Treino concluido",
      content:
      "Hoje consegui bater meu recorde na academia. Pequenos avanços importam.",
      authorId: userIds[2],
    },
    {
      title: "Música favorita da semana",
      content:
      "Descobri uma banda nova e não consigo parar de ouvir as músicas deles.",
      authorId: userIds[1],
    },
    {
      title: "Chuva boa",
      content: "A melhor sensação é ouvir chuva forte enquanto descanso em casa.",
      authorId: userIds[0],
    },
    {
      title: "Fim de tarde na praia",
      content:
      "Nada melhor do que assistir o por do sol depois de um dia cansativo.",
      authorId: userIds[0],
    },
    {
      title: "Teste contas já existentes também!",
      content:
      "login: maironlmelo@gmail.com | senha: password123\nlogin: mariaeduarda@example.com | senha: password123\nlogin: rafaelborges@example.com | senha: password123",
      authorId: userIds[0],
    },
    {
      title: "Espero que goste!",
      content:
        "Obrigado pela atenção.",
      image: "Gemini_Generated_Image_4f4fld4f4fld4f4f.png",
      authorId: userIds[0],
    },
  ];
  
  for (const p of posts) {
    await db.query(
      "INSERT INTO posts (title, content, image, \"authorId\") VALUES ($1, $2, $3, $4)",
      [p.title, p.content, p.image ?? null, p.authorId]
    );
  }
  
  console.log(`? ${posts.length} posts criados.`);
  
  // Criar alguns likes aleat�rios
  const postsRes = await db.query("SELECT id FROM posts");
  const allPosts = postsRes.rows;
  
  for (let index = 0; index < allPosts.length; index++) {
    const post = allPosts[index];
    if (index % 2 === 0) await db.query("INSERT INTO likes (\"postId\", \"userId\") VALUES ($1, $2)", [post.id, userIds[0]]);
    if (index % 3 === 0) await db.query("INSERT INTO likes (\"postId\", \"userId\") VALUES ($1, $2)", [post.id, userIds[1]]);
  }

  console.log("? Likes iniciais adicionados.");
  console.log("?? Banco de dados populado com sucesso!");
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao popular o banco:", err);
  process.exit(1);
});

