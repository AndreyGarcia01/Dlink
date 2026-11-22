

INSERT INTO "content_articles" ("id", "title", "body", "video_url", "transcript", "created_at", "updated_at")
SELECT gen_random_uuid()::text, t.title, t.body, NULL, t.transcript, now() + t.ordem * interval '1 second', now()
FROM (VALUES
  (1,
   'Lei de Cotas: vagas reservadas para pessoas com deficiência',
   'A Lei nº 8.213/1991 (artigo 93), conhecida como Lei de Cotas, obriga empresas com 100 ou mais empregados a reservar parte das vagas para pessoas com deficiência ou reabilitadas pelo INSS. A porcentagem depende do tamanho da empresa: de 100 a 200 empregados, 2%; de 201 a 500, 3%; de 501 a 1.000, 4%; acima de 1.000, 5%. A mesma lei também prevê que, para demitir sem justa causa uma pessoa com deficiência, a empresa contrate outra pessoa em condição parecida (a forma de aplicar essa regra ainda é discutida na Justiça do Trabalho).',
   'Empresas com 100 funcionários ou mais precisam ter de 2% a 5% das vagas ocupadas por pessoas com deficiência. Pessoas surdas podem concorrer a essas vagas.'),
  (2,
   'Surdez e deficiência auditiva perante a lei',
   'A Lei nº 14.768/2023 definiu o que é deficiência auditiva para a lei brasileira: a limitação de longo prazo da audição, em um só ouvido (perda total) ou nos dois ouvidos (perda parcial ou total), que, junto com as barreiras do dia a dia, dificulta a participação plena na sociedade. Com isso, pessoas com surdez total em um só ouvido também passaram a ter os direitos de pessoa com deficiência, como concorrer às vagas da Lei de Cotas. Para comprovar, normalmente é pedido um laudo com exame de audição (audiometria).',
   'Surdez total em um ouvido, ou perda parcial ou total nos dois ouvidos, de longo prazo, conta como deficiência auditiva e dá os mesmos direitos. Guarde o seu laudo de audiometria.'),
  (3,
   'Libras é língua oficial: seu direito à comunicação',
   'A Lei nº 10.436/2002 reconhece a Língua Brasileira de Sinais (Libras) como meio legal de comunicação e expressão, e o Decreto nº 5.626/2005 regulamenta essa lei. A Lei Brasileira de Inclusão (Lei nº 13.146/2015) garante acessibilidade na comunicação e proíbe que a deficiência seja motivo para excluir alguém de qualquer etapa do trabalho: recrutamento, seleção, contratação, exames, permanência e promoção. Ela também prevê "adaptações razoáveis", que são ajustes que a empresa deve fazer para a pessoa com deficiência trabalhar em igualdade de condições. Na prática, você pode pedir que a empresa use intérprete de Libras, comunicação por texto ou outra forma acessível na entrevista e no dia a dia. No D-Link, ao se candidatar, você informa se precisa de intérprete.',
   'Libras é uma língua oficial do Brasil. Você tem direito a comunicação acessível no processo seletivo e no trabalho, como intérprete de Libras ou comunicação por texto.'),
  (4,
   'Sofreu discriminação? Saiba onde denunciar',
   'Recusar uma vaga, impedir uma promoção ou tratar alguém de forma diferente por causa da deficiência é discriminação, proibida pela Lei Brasileira de Inclusão (Lei nº 13.146/2015) e considerada crime pela própria LBI e pela Lei nº 7.853/1989. Se isso acontecer: guarde provas (mensagens, e-mails, anúncios de vaga, nomes de testemunhas) e procure o Ministério Público do Trabalho (MPT), que recebe denúncias pela internet; o Disque 100 (Direitos Humanos), que tem atendimento acessível; ou a Defensoria Pública, que oferece orientação jurídica gratuita.',
   'Ser recusado ou tratado diferente por ser surdo é discriminação e é crime. Guarde provas e denuncie ao Ministério Público do Trabalho, ao Disque 100 ou à Defensoria Pública.')
) AS t(ordem, title, body, transcript)
WHERE NOT EXISTS (
  SELECT 1 FROM "content_articles" c WHERE c."title" = t.title
);
