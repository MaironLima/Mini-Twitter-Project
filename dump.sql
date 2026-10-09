--
-- PostgreSQL database dump
--

\restrict 2ycqeVQMPfa9j07s3gD59rR3l9yVFKpe10HxkuQrhlSJGz1YDvbebHmeG29PoON

-- Dumped from database version 15.19
-- Dumped by pg_dump version 15.19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: user_mini_twitter
--

CREATE TABLE public.likes (
    id integer NOT NULL,
    "postId" integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.likes OWNER TO user_mini_twitter;

--
-- Name: likes_id_seq; Type: SEQUENCE; Schema: public; Owner: user_mini_twitter
--

CREATE SEQUENCE public.likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.likes_id_seq OWNER TO user_mini_twitter;

--
-- Name: likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user_mini_twitter
--

ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: user_mini_twitter
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    image text,
    "authorId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.posts OWNER TO user_mini_twitter;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: user_mini_twitter
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_id_seq OWNER TO user_mini_twitter;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user_mini_twitter
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: tokens_blacklist; Type: TABLE; Schema: public; Owner: user_mini_twitter
--

CREATE TABLE public.tokens_blacklist (
    id integer NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tokens_blacklist OWNER TO user_mini_twitter;

--
-- Name: tokens_blacklist_id_seq; Type: SEQUENCE; Schema: public; Owner: user_mini_twitter
--

CREATE SEQUENCE public.tokens_blacklist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tokens_blacklist_id_seq OWNER TO user_mini_twitter;

--
-- Name: tokens_blacklist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user_mini_twitter
--

ALTER SEQUENCE public.tokens_blacklist_id_seq OWNED BY public.tokens_blacklist.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: user_mini_twitter
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO user_mini_twitter;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: user_mini_twitter
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO user_mini_twitter;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user_mini_twitter
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: likes id; Type: DEFAULT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.likes ALTER COLUMN id SET DEFAULT nextval('public.likes_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: tokens_blacklist id; Type: DEFAULT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.tokens_blacklist ALTER COLUMN id SET DEFAULT nextval('public.tokens_blacklist_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: user_mini_twitter
--

COPY public.likes (id, "postId", "userId", "createdAt") FROM stdin;
1	1	1	2026-08-20 12:45:57.854973
2	1	2	2026-08-20 12:45:57.857204
3	3	1	2026-08-20 12:45:57.858681
4	4	2	2026-08-20 12:45:57.86008
5	5	1	2026-08-20 12:45:57.861426
6	7	1	2026-08-20 12:45:57.862774
7	7	2	2026-08-20 12:45:57.864583
8	9	1	2026-08-20 12:45:57.8661
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: user_mini_twitter
--

COPY public.posts (id, title, content, image, "authorId", "createdAt") FROM stdin;
1	Filme do final de semana	Assisti um filme de suspense ontem e o final me pegou completamente de surpresa.	\N	2	2026-08-20 12:45:57.838451
2	Café da manhã perfeito	Pão quentinho, cafée frutas fazem qualquer manhã começar melhor.	\N	3	2026-08-20 12:45:57.841237
3	Vontade de viajar	Tenho muita vontade de conhecer o Japão algum dia.	\N	1	2026-08-20 12:45:57.842785
4	Treino concluido	Hoje consegui bater meu recorde na academia. Pequenos avanços importam.	\N	3	2026-08-20 12:45:57.844468
5	Música favorita da semana	Descobri uma banda nova e não consigo parar de ouvir as músicas deles.	\N	2	2026-08-20 12:45:57.84587
6	Chuva boa	A melhor sensação é ouvir chuva forte enquanto descanso em casa.	\N	1	2026-08-20 12:45:57.847348
7	Fim de tarde na praia	Nada melhor do que assistir o por do sol depois de um dia cansativo.	\N	1	2026-08-20 12:45:57.849014
8	Teste contas já existentes também!	login: maironlmelo@gmail.com | senha: password123\nlogin: mariaeduarda@example.com | senha: password123\nlogin: rafaelborges@example.com | senha: password123	\N	1	2026-08-20 12:45:57.850374
9	Espero que goste!	Obrigado pela atenção.	Gemini_Generated_Image_4f4fld4f4fld4f4f.png	1	2026-08-20 12:45:57.851933
\.


--
-- Data for Name: tokens_blacklist; Type: TABLE DATA; Schema: public; Owner: user_mini_twitter
--

COPY public.tokens_blacklist (id, token, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: user_mini_twitter
--

COPY public.users (id, name, email, password) FROM stdin;
1	Mairon Lima	maironlmelo@gmail.com	password123
2	Maria Eduarda	mariaeduarda@example.com	password123
3	Rafael Borges	rafaelborges@example.com	password123
4	Maaaairon	maironldm@gmail.com	mairon.1912
\.


--
-- Name: likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user_mini_twitter
--

SELECT pg_catalog.setval('public.likes_id_seq', 10, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user_mini_twitter
--

SELECT pg_catalog.setval('public.posts_id_seq', 9, true);


--
-- Name: tokens_blacklist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user_mini_twitter
--

SELECT pg_catalog.setval('public.tokens_blacklist_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user_mini_twitter
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: likes likes_postId_userId_key; Type: CONSTRAINT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_postId_userId_key" UNIQUE ("postId", "userId");


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: tokens_blacklist tokens_blacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.tokens_blacklist
    ADD CONSTRAINT tokens_blacklist_pkey PRIMARY KEY (id);


--
-- Name: tokens_blacklist tokens_blacklist_token_key; Type: CONSTRAINT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.tokens_blacklist
    ADD CONSTRAINT tokens_blacklist_token_key UNIQUE (token);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: likes likes_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: likes likes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user_mini_twitter
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2ycqeVQMPfa9j07s3gD59rR3l9yVFKpe10HxkuQrhlSJGz1YDvbebHmeG29PoON

