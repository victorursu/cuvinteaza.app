-- Add 20 more brand new Romanian words to cuvinteziCuvinte table
-- These are additional new words not in the existing fallback vocabulary

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES
  (
    'a-se-apropia-37',
    'a se apropia',
    'verb (reflexiv, infinitiv)',
    'A veni mai aproape de ceva sau cineva; a reduce distanța. Te apropii când mergi sau te miști către un loc sau o persoană.',
    'https://picsum.photos/seed/apropia/800/600',
    '["acțiuni","spațiu","comportament"]'::jsonb,
    '["S-a <strong>apropiat</strong> de fereastră să vadă mai bine.","Se <strong>apropie</strong> momentul decisiv."]'::jsonb
  ),
  (
    'stralucitor-38',
    'strălucitor',
    'adjectiv',
    'Care strălucește puternic, care emite lumină intensă; foarte strălucit, remarcabil. Ceva strălucitor atrage atenția prin luminozitatea sa.',
    'https://picsum.photos/seed/stralucitor/800/600',
    '["descriere","vizual","pozitiv"]'::jsonb,
    '["Un soare <strong>strălucitor</strong> de vară.","A avut o idee <strong>strălucitoare</strong> pentru proiect."]'::jsonb
  ),
  (
    'a-se-intoarce-39',
    'a se întoarce',
    'verb (reflexiv, infinitiv)',
    'A veni înapoi la un loc de unde ai plecat; a reveni, a se duce înapoi. Te întorci când mergi în direcția opusă sau când revii la un punct de plecare.',
    'https://picsum.photos/seed/intoarce/800/600',
    '["acțiuni","spațiu","mișcare"]'::jsonb,
    '["S-a <strong>întors</strong> acasă după o zi lungă.","Se va <strong>întoarce</strong> mâine dimineață."]'::jsonb
  ),
  (
    'adanc-40',
    'adânc',
    'adjectiv',
    'Care are o mare adâncime; care se întinde mult în jos sau în interior. Poate fi literal (o groapă adâncă) sau figurat (gânduri adânci, sentimente adânci).',
    'https://picsum.photos/seed/adanc/800/600',
    '["descriere","spațiu","abstract"]'::jsonb,
    '["Un râu <strong>adânc</strong> și periculos.","A avut o conversație <strong>adâncă</strong> despre viață."]'::jsonb
  ),
  (
    'a-observa-41',
    'a observa',
    'verb (infinitiv)',
    'A privi cu atenție, a examina, a remarca; a fi atent la detalii și a le nota. Observi când studiezi sau analizezi ceva cu grijă.',
    'https://picsum.photos/seed/observa/800/600',
    '["acțiuni","atenție","cunoaștere"]'::jsonb,
    '["A <strong>observat</strong> că ceva nu era în regulă.","<strong>Observă</strong> cum se schimbă culorile toamna."]'::jsonb
  ),
  (
    'cald-42',
    'cald',
    'adjectiv',
    'Care are o temperatură ridicată, plăcută; care dă senzația de căldură. Poate descrie vremea, mâncarea, sentimentele sau atmosfera.',
    'https://picsum.photos/seed/cald/800/600',
    '["descriere","temperatură","senzații"]'::jsonb,
    '["O zi <strong>caldă</strong> de vară.","A primit o primire <strong>caldă</strong> și prietenoasă."]'::jsonb
  ),
  (
    'a-implora-43',
    'a implora',
    'verb (infinitiv)',
    'A cere cu insistență, a ruga cu disperare; a cere ceva cu multă intensitate și urgență. Implori când ai nevoie urgentă de ceva.',
    'https://picsum.photos/seed/implora/800/600',
    '["acțiuni","emoții","comunicare"]'::jsonb,
    '["L-a <strong>implorat</strong> să nu plece.","A <strong>implorat</strong> iertare pentru greșeala făcută."]'::jsonb
  ),
  (
    'fragil-44',
    'fragil',
    'adjectiv',
    'Care se sparge sau se strică ușor; delicat, vulnerabil. Ceva fragil necesită grijă și atenție specială pentru a nu fi deteriorat.',
    'https://picsum.photos/seed/fragil/800/600',
    '["descriere","calitate","vulnerabilitate"]'::jsonb,
    '["Un obiect <strong>fragil</strong> care trebuie manevrat cu grijă.","O stare emoțională <strong>fragilă</strong> după eveniment."]'::jsonb
  ),
  (
    'a-respecta-45',
    'a respecta',
    'verb (infinitiv)',
    'A avea considerație și stimă pentru cineva sau ceva; a recunoaște valoarea și demnitatea. Respecți când tratezi pe cineva sau ceva cu onoare și atenție.',
    'https://picsum.photos/seed/respecta/800/600',
    '["acțiuni","comportament","valori"]'::jsonb,
    '["Trebuie să <strong>respeți</strong> opiniile altora.","A <strong>respectat</strong> întotdeauna regulile."]'::jsonb
  ),
  (
    'misterios-46',
    'misterios',
    'adjectiv',
    'Care este plin de mister, care nu poate fi explicat ușor; enigmatic, secretos. Ceva misterios atrage curiozitatea și provoacă întrebări.',
    'https://picsum.photos/seed/misterios/800/600',
    '["descriere","abstract","atractiv"]'::jsonb,
    '["Un zâmbet <strong>misterios</strong> care ascunde ceva.","O poveste <strong>misterioasă</strong> despre trecut."]'::jsonb
  ),
  (
    'a-se-razbuna-47',
    'a se răzbuna',
    'verb (reflexiv, infinitiv)',
    'A răspunde la o răutate sau o nedreptate prin acțiuni similare; a pedepsi pe cineva pentru ceva rău făcut. Te răzbuni când acționezi în răspuns la o ofensă.',
    'https://picsum.photos/seed/razbuna/800/600',
    '["acțiuni","emoții","negativ"]'::jsonb,
    '["S-a <strong>răzbunat</strong> pentru toate nedreptățile.","Nu trebuie să te <strong>răzbuni</strong>, ci să ierți."]'::jsonb
  ),
  (
    'a-se-razgandi-48',
    'a se răzgândi',
    'verb (reflexiv, infinitiv)',
    'A-ți schimba părerea sau decizia; a reconsidera ceva și a alege altceva. Te răzgândești când realizezi că prima ta alegere nu era cea mai bună.',
    'https://picsum.photos/seed/razgandi/800/600',
    '["acțiuni","decizii","comportament"]'::jsonb,
    '["S-a <strong>răzgândit</strong> și a anulat călătoria.","După ce a reflectat, s-a <strong>răzgândit</strong> complet."]'::jsonb
  ),
  (
    'a-se-implini-49',
    'a se împlini',
    'verb (reflexiv, infinitiv)',
    'A deveni complet, a se realiza; a ajunge la finalizare sau la îndeplinire. Ceva se împlinește când devine realitate sau când ajunge la final.',
    'https://picsum.photos/seed/implini/800/600',
    '["acțiuni","realizare","abstract"]'::jsonb,
    '["Visul i s-a <strong>împlinit</strong> după mulți ani.","Termenul se <strong>împlinește</strong> mâine."]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = timezone('utc'::text, now());
