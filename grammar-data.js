// ============================================================
// Grammar Data - Verb tables, rules, and exercises
// ============================================================

const GRAMMAR_DATA = {
  subjects: ['yo', 'tú', 'él/ella/Ud.', 'nosotros', 'vosotros', 'ellos/ellas/Uds.'],
  subjectsShort: ['yo', 'tú', 'él', 'nosotros', 'vosotros', 'ellos'],

  // Regular verb endings by tense and type
  endings: {
    present: {
      ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
      er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
      ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
    },
    preterite: {
      ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
      er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
      ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    },
    imperfect: {
      ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
      er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
      ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    },
    subjunctive: {
      ar: ['e', 'es', 'e', 'emos', 'éis', 'en'],
      er: ['a', 'as', 'a', 'amos', 'áis', 'an'],
      ir: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    },
    future: {
      ar: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
      er: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
      ir: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
    },
    conditional: {
      ar: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
      er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
      ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    },
  },

  // Future/conditional use full infinitive as stem for regular verbs
  futureStemIsInfinitive: true,

  // Regular verbs for drills
  regularVerbs: {
    ar: [
      { infinitive: 'hablar', english: 'to speak', stem: 'habl' },
      { infinitive: 'trabajar', english: 'to work', stem: 'trabaj' },
      { infinitive: 'estudiar', english: 'to study', stem: 'estudi' },
      { infinitive: 'caminar', english: 'to walk', stem: 'camin' },
      { infinitive: 'cocinar', english: 'to cook', stem: 'cocin' },
      { infinitive: 'bailar', english: 'to dance', stem: 'bail' },
      { infinitive: 'cantar', english: 'to sing', stem: 'cant' },
      { infinitive: 'comprar', english: 'to buy', stem: 'compr' },
      { infinitive: 'llamar', english: 'to call', stem: 'llam' },
      { infinitive: 'nadar', english: 'to swim', stem: 'nad' },
      { infinitive: 'viajar', english: 'to travel', stem: 'viaj' },
      { infinitive: 'buscar', english: 'to look for', stem: 'busc' },
      { infinitive: 'llegar', english: 'to arrive', stem: 'lleg' },
      { infinitive: 'tomar', english: 'to take/drink', stem: 'tom' },
      { infinitive: 'pagar', english: 'to pay', stem: 'pag' },
    ],
    er: [
      { infinitive: 'comer', english: 'to eat', stem: 'com' },
      { infinitive: 'beber', english: 'to drink', stem: 'beb' },
      { infinitive: 'correr', english: 'to run', stem: 'corr' },
      { infinitive: 'leer', english: 'to read', stem: 'le' },
      { infinitive: 'aprender', english: 'to learn', stem: 'aprend' },
      { infinitive: 'comprender', english: 'to understand', stem: 'comprend' },
      { infinitive: 'vender', english: 'to sell', stem: 'vend' },
      { infinitive: 'creer', english: 'to believe', stem: 'cre' },
      { infinitive: 'romper', english: 'to break', stem: 'romp' },
      { infinitive: 'responder', english: 'to respond', stem: 'respond' },
    ],
    ir: [
      { infinitive: 'vivir', english: 'to live', stem: 'viv' },
      { infinitive: 'escribir', english: 'to write', stem: 'escrib' },
      { infinitive: 'abrir', english: 'to open', stem: 'abr' },
      { infinitive: 'recibir', english: 'to receive', stem: 'recib' },
      { infinitive: 'decidir', english: 'to decide', stem: 'decid' },
      { infinitive: 'subir', english: 'to go up', stem: 'sub' },
      { infinitive: 'compartir', english: 'to share', stem: 'compart' },
      { infinitive: 'describir', english: 'to describe', stem: 'describ' },
      { infinitive: 'existir', english: 'to exist', stem: 'exist' },
      { infinitive: 'asistir', english: 'to attend', stem: 'asist' },
    ],
  },

  // Irregular verb conjugations (full overrides)
  irregularVerbs: [
    {
      infinitive: 'ser', english: 'to be (essential)',
      conjugations: {
        present:     ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
        preterite:   ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
        imperfect:   ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
        subjunctive: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
        future:      ['seré', 'serás', 'será', 'seremos', 'seréis', 'serán'],
        conditional: ['sería', 'serías', 'sería', 'seríamos', 'seríais', 'serían'],
      }
    },
    {
      infinitive: 'estar', english: 'to be (state/location)',
      conjugations: {
        present:     ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
        preterite:   ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron'],
        imperfect:   ['estaba', 'estabas', 'estaba', 'estábamos', 'estabais', 'estaban'],
        subjunctive: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'],
        future:      ['estaré', 'estarás', 'estará', 'estaremos', 'estaréis', 'estarán'],
        conditional: ['estaría', 'estarías', 'estaría', 'estaríamos', 'estaríais', 'estarían'],
      }
    },
    {
      infinitive: 'ir', english: 'to go',
      conjugations: {
        present:     ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
        preterite:   ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
        imperfect:   ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
        subjunctive: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
        future:      ['iré', 'irás', 'irá', 'iremos', 'iréis', 'irán'],
        conditional: ['iría', 'irías', 'iría', 'iríamos', 'iríais', 'irían'],
      }
    },
    {
      infinitive: 'tener', english: 'to have',
      conjugations: {
        present:     ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
        preterite:   ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
        imperfect:   ['tenía', 'tenías', 'tenía', 'teníamos', 'teníais', 'tenían'],
        subjunctive: ['tenga', 'tengas', 'tenga', 'tengamos', 'tengáis', 'tengan'],
        future:      ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán'],
        conditional: ['tendría', 'tendrías', 'tendría', 'tendríamos', 'tendríais', 'tendrían'],
      }
    },
    {
      infinitive: 'hacer', english: 'to do/make',
      conjugations: {
        present:     ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
        preterite:   ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'],
        imperfect:   ['hacía', 'hacías', 'hacía', 'hacíamos', 'hacíais', 'hacían'],
        subjunctive: ['haga', 'hagas', 'haga', 'hagamos', 'hagáis', 'hagan'],
        future:      ['haré', 'harás', 'hará', 'haremos', 'haréis', 'harán'],
        conditional: ['haría', 'harías', 'haría', 'haríamos', 'haríais', 'harían'],
      }
    },
    {
      infinitive: 'poder', english: 'to be able to',
      conjugations: {
        present:     ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
        preterite:   ['pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron'],
        imperfect:   ['podía', 'podías', 'podía', 'podíamos', 'podíais', 'podían'],
        subjunctive: ['pueda', 'puedas', 'pueda', 'podamos', 'podáis', 'puedan'],
        future:      ['podré', 'podrás', 'podrá', 'podremos', 'podréis', 'podrán'],
        conditional: ['podría', 'podrías', 'podría', 'podríamos', 'podríais', 'podrían'],
      }
    },
    {
      infinitive: 'querer', english: 'to want',
      conjugations: {
        present:     ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
        preterite:   ['quise', 'quisiste', 'quiso', 'quisimos', 'quisisteis', 'quisieron'],
        imperfect:   ['quería', 'querías', 'quería', 'queríamos', 'queríais', 'querían'],
        subjunctive: ['quiera', 'quieras', 'quiera', 'queramos', 'queráis', 'quieran'],
        future:      ['querré', 'querrás', 'querrá', 'querremos', 'querréis', 'querrán'],
        conditional: ['querría', 'querrías', 'querría', 'querríamos', 'querríais', 'querrían'],
      }
    },
    {
      infinitive: 'decir', english: 'to say/tell',
      conjugations: {
        present:     ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
        preterite:   ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron'],
        imperfect:   ['decía', 'decías', 'decía', 'decíamos', 'decíais', 'decían'],
        subjunctive: ['diga', 'digas', 'diga', 'digamos', 'digáis', 'digan'],
        future:      ['diré', 'dirás', 'dirá', 'diremos', 'diréis', 'dirán'],
        conditional: ['diría', 'dirías', 'diría', 'diríamos', 'diríais', 'dirían'],
      }
    },
    {
      infinitive: 'saber', english: 'to know (facts)',
      conjugations: {
        present:     ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'],
        preterite:   ['supe', 'supiste', 'supo', 'supimos', 'supisteis', 'supieron'],
        imperfect:   ['sabía', 'sabías', 'sabía', 'sabíamos', 'sabíais', 'sabían'],
        subjunctive: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepáis', 'sepan'],
        future:      ['sabré', 'sabrás', 'sabrá', 'sabremos', 'sabréis', 'sabrán'],
        conditional: ['sabría', 'sabrías', 'sabría', 'sabríamos', 'sabríais', 'sabrían'],
      }
    },
    {
      infinitive: 'venir', english: 'to come',
      conjugations: {
        present:     ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
        preterite:   ['vine', 'viniste', 'vino', 'vinimos', 'vinisteis', 'vinieron'],
        imperfect:   ['venía', 'venías', 'venía', 'veníamos', 'veníais', 'venían'],
        subjunctive: ['venga', 'vengas', 'venga', 'vengamos', 'vengáis', 'vengan'],
        future:      ['vendré', 'vendrás', 'vendrá', 'vendremos', 'vendréis', 'vendrán'],
        conditional: ['vendría', 'vendrías', 'vendría', 'vendríamos', 'vendríais', 'vendrían'],
      }
    },
    {
      infinitive: 'dar', english: 'to give',
      conjugations: {
        present:     ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
        preterite:   ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'],
        imperfect:   ['daba', 'dabas', 'daba', 'dábamos', 'dabais', 'daban'],
        subjunctive: ['dé', 'des', 'dé', 'demos', 'deis', 'den'],
        future:      ['daré', 'darás', 'dará', 'daremos', 'daréis', 'darán'],
        conditional: ['daría', 'darías', 'daría', 'daríamos', 'daríais', 'darían'],
      }
    },
    {
      infinitive: 'poner', english: 'to put',
      conjugations: {
        present:     ['pongo', 'pones', 'pone', 'ponemos', 'ponéis', 'ponen'],
        preterite:   ['puse', 'pusiste', 'puso', 'pusimos', 'pusisteis', 'pusieron'],
        imperfect:   ['ponía', 'ponías', 'ponía', 'poníamos', 'poníais', 'ponían'],
        subjunctive: ['ponga', 'pongas', 'ponga', 'pongamos', 'pongáis', 'pongan'],
        future:      ['pondré', 'pondrás', 'pondrá', 'pondremos', 'pondréis', 'pondrán'],
        conditional: ['pondría', 'pondrías', 'pondría', 'pondríamos', 'pondríais', 'pondrían'],
      }
    },
    {
      infinitive: 'salir', english: 'to leave/go out',
      conjugations: {
        present:     ['salgo', 'sales', 'sale', 'salimos', 'salís', 'salen'],
        preterite:   ['salí', 'saliste', 'salió', 'salimos', 'salisteis', 'salieron'],
        imperfect:   ['salía', 'salías', 'salía', 'salíamos', 'salíais', 'salían'],
        subjunctive: ['salga', 'salgas', 'salga', 'salgamos', 'salgáis', 'salgan'],
        future:      ['saldré', 'saldrás', 'saldrá', 'saldremos', 'saldréis', 'saldrán'],
        conditional: ['saldría', 'saldrías', 'saldría', 'saldríamos', 'saldríais', 'saldrían'],
      }
    },
    {
      infinitive: 'conocer', english: 'to know (people/places)',
      conjugations: {
        present:     ['conozco', 'conoces', 'conoce', 'conocemos', 'conocéis', 'conocen'],
        preterite:   ['conocí', 'conociste', 'conoció', 'conocimos', 'conocisteis', 'conocieron'],
        imperfect:   ['conocía', 'conocías', 'conocía', 'conocíamos', 'conocíais', 'conocían'],
        subjunctive: ['conozca', 'conozcas', 'conozca', 'conozcamos', 'conozcáis', 'conozcan'],
        future:      ['conoceré', 'conocerás', 'conocerá', 'conoceremos', 'conoceréis', 'conocerán'],
        conditional: ['conocería', 'conocerías', 'conocería', 'conoceríamos', 'conoceríais', 'conocerían'],
      }
    },
    {
      infinitive: 'dormir', english: 'to sleep',
      conjugations: {
        present:     ['duermo', 'duermes', 'duerme', 'dormimos', 'dormís', 'duermen'],
        preterite:   ['dormí', 'dormiste', 'durmió', 'dormimos', 'dormisteis', 'durmieron'],
        imperfect:   ['dormía', 'dormías', 'dormía', 'dormíamos', 'dormíais', 'dormían'],
        subjunctive: ['duerma', 'duermas', 'duerma', 'durmamos', 'durmáis', 'duerman'],
        future:      ['dormiré', 'dormirás', 'dormirá', 'dormiremos', 'dormiréis', 'dormirán'],
        conditional: ['dormiría', 'dormirías', 'dormiría', 'dormiríamos', 'dormiríais', 'dormirían'],
      }
    },
    {
      infinitive: 'pedir', english: 'to ask for/order',
      conjugations: {
        present:     ['pido', 'pides', 'pide', 'pedimos', 'pedís', 'piden'],
        preterite:   ['pedí', 'pediste', 'pidió', 'pedimos', 'pedisteis', 'pidieron'],
        imperfect:   ['pedía', 'pedías', 'pedía', 'pedíamos', 'pedíais', 'pedían'],
        subjunctive: ['pida', 'pidas', 'pida', 'pidamos', 'pidáis', 'pidan'],
        future:      ['pediré', 'pedirás', 'pedirá', 'pediremos', 'pediréis', 'pedirán'],
        conditional: ['pediría', 'pedirías', 'pediría', 'pediríamos', 'pediríais', 'pedirían'],
      }
    },
  ],

  // Tense display names
  tenseNames: {
    present: 'Present',
    preterite: 'Preterite',
    imperfect: 'Imperfect',
    subjunctive: 'Subjunctive',
    future: 'Future',
    conditional: 'Conditional',
  },

  // Tier definitions — CEFR-aligned
  tiers: {
    A: {
      label: 'A Tier',
      subtitle: 'A1/A2 Beginner',
      exerciseTopics: [
        { id: 'present', label: 'Present' },
        { id: 'serVsEstar', label: 'Ser vs Estar' },
      ],
      sheetTopics: [
        { id: 'present', label: 'Present' },
        { id: 'serVsEstar', label: 'Ser vs Estar' },
        { id: 'gender', label: 'Gender' },
      ],
    },
    B: {
      label: 'B Tier',
      subtitle: 'B1/B2 Intermediate',
      exerciseTopics: [
        { id: 'preterite', label: 'Preterite' },
        { id: 'imperfect', label: 'Imperfect' },
        { id: 'preteriteVsImperfect', label: 'Pret. vs Imp.' },
        { id: 'future', label: 'Future' },
        { id: 'conditional', label: 'Conditional' },
        { id: 'subjunctive', label: 'Subjunctive' },
        { id: 'porVsPara', label: 'Por vs Para' },
      ],
      sheetTopics: [
        { id: 'preterite', label: 'Preterite' },
        { id: 'imperfect', label: 'Imperfect' },
        { id: 'future', label: 'Future' },
        { id: 'conditional', label: 'Conditional' },
        { id: 'subjunctive', label: 'Subjunctive' },
        { id: 'porVsPara', label: 'Por vs Para' },
      ],
    },
  },

  // Grammar rules for cheat sheets
  rules: {
    serVsEstar: {
      title: 'Ser vs Estar',
      description: 'Both mean "to be" but are used in different contexts.',
      sections: [
        {
          heading: 'SER — Use DOCTOR',
          mnemonic: 'DOCTOR',
          items: [
            { letter: 'D', rule: 'Description / Characteristics', example: 'Ella es alta. (She is tall.)' },
            { letter: 'O', rule: 'Occupation', example: 'Él es médico. (He is a doctor.)' },
            { letter: 'C', rule: 'Characteristics (personality)', example: 'Somos amables. (We are kind.)' },
            { letter: 'T', rule: 'Time / Date', example: 'Son las tres. (It is 3 o\'clock.)' },
            { letter: 'O', rule: 'Origin', example: 'Soy de México. (I am from Mexico.)' },
            { letter: 'R', rule: 'Relationships', example: 'Es mi hermana. (She is my sister.)' },
          ]
        },
        {
          heading: 'ESTAR — Use PLACE',
          mnemonic: 'PLACE',
          items: [
            { letter: 'P', rule: 'Position / Location', example: 'Estoy en casa. (I am at home.)' },
            { letter: 'L', rule: 'Location', example: 'Madrid está en España. (Madrid is in Spain.)' },
            { letter: 'A', rule: 'Action (progressive)', example: 'Estoy comiendo. (I am eating.)' },
            { letter: 'C', rule: 'Condition (temporary)', example: 'Estoy cansado. (I am tired.)' },
            { letter: 'E', rule: 'Emotion', example: 'Está triste. (He/she is sad.)' },
          ]
        },
      ],
      tips: [
        'Ser = permanent/inherent qualities; Estar = temporary states/conditions',
        'Some adjectives change meaning: Es listo (He is clever) vs Está listo (He is ready)',
        'Estar is always used for location of people/objects, even if permanent',
      ]
    },

    porVsPara: {
      title: 'Por vs Para',
      description: 'Two prepositions that both translate to "for" in English, but with different uses.',
      sections: [
        {
          heading: 'POR — Cause, Exchange, Duration',
          items: [
            { rule: 'Cause / Reason (because of)', example: 'Lo hice por ti. (I did it because of you.)' },
            { rule: 'Duration of time', example: 'Estudié por dos horas. (I studied for two hours.)' },
            { rule: 'Exchange / Price', example: 'Lo compré por $20. (I bought it for $20.)' },
            { rule: 'Through / Along', example: 'Caminé por el parque. (I walked through the park.)' },
            { rule: 'Per / Rate', example: 'Gano $15 por hora. (I earn $15 per hour.)' },
            { rule: 'By means of', example: 'Te llamo por teléfono. (I\'ll call you by phone.)' },
            { rule: 'On behalf of', example: 'Habló por nosotros. (He spoke on behalf of us.)' },
          ]
        },
        {
          heading: 'PARA — Purpose, Destination, Deadline',
          items: [
            { rule: 'Purpose / Goal (in order to)', example: 'Estudio para aprender. (I study in order to learn.)' },
            { rule: 'Destination', example: 'Salgo para Madrid. (I\'m leaving for Madrid.)' },
            { rule: 'Deadline', example: 'Es para el lunes. (It\'s due for Monday.)' },
            { rule: 'Recipient', example: 'Este regalo es para ti. (This gift is for you.)' },
            { rule: 'Comparison (considering)', example: 'Para un niño, habla bien. (For a kid, he speaks well.)' },
            { rule: 'Opinion', example: 'Para mí, es fácil. (For me, it\'s easy.)' },
            { rule: 'Employment', example: 'Trabajo para Google. (I work for Google.)' },
          ]
        },
      ],
      tips: [
        'Think: POR = backward-looking (cause), PARA = forward-looking (purpose)',
        'Duration: por = how long, para = deadline',
        '"Gracias por" = thanks for (something done), never "gracias para"',
      ]
    },

    gender: {
      title: 'Gender Rules',
      description: 'Spanish nouns are masculine or feminine. These rules help predict gender.',
      sections: [
        {
          heading: 'Masculine (-o, -or, -aje, -ma)',
          items: [
            { rule: 'Nouns ending in -o', example: 'el libro, el gato, el cielo' },
            { rule: 'Nouns ending in -or', example: 'el color, el calor, el amor' },
            { rule: 'Nouns ending in -aje', example: 'el viaje, el paisaje, el lenguaje' },
            { rule: 'Greek-origin words ending in -ma', example: 'el problema, el tema, el sistema, el programa' },
            { rule: 'Days, months, colors, languages', example: 'el lunes, el enero, el rojo, el español' },
          ]
        },
        {
          heading: 'Feminine (-a, -ción, -dad, -tud)',
          items: [
            { rule: 'Nouns ending in -a', example: 'la casa, la mesa, la ventana' },
            { rule: 'Nouns ending in -ción / -sión', example: 'la nación, la decisión, la televisión' },
            { rule: 'Nouns ending in -dad / -tad', example: 'la ciudad, la libertad, la verdad' },
            { rule: 'Nouns ending in -tud', example: 'la actitud, la juventud, la virtud' },
            { rule: 'Nouns ending in -umbre', example: 'la costumbre, la muchedumbre' },
          ]
        },
        {
          heading: 'Common Exceptions',
          items: [
            { rule: 'Feminine -o words', example: 'la mano, la foto, la moto, la radio' },
            { rule: 'Masculine -a words', example: 'el día, el mapa, el planeta, el sofá' },
            { rule: 'Words with el + feminine', example: 'el agua (feminine!), el alma, el águila — use "el" for sound' },
          ]
        },
      ],
      tips: [
        'When in doubt, words ending in -o are ~99% masculine, -a are ~96% feminine',
        'Professions often have both forms: el doctor / la doctora',
        'el agua is grammatically feminine: "el agua fría" (not "el agua frío")',
      ]
    },

    future: {
      title: 'Future Tense',
      description: 'Used for actions that will happen. Add endings to the full infinitive.',
      sections: [
        {
          heading: 'Formation',
          items: [
            { rule: 'All verbs: infinitive + endings', example: 'hablar + é = hablaré (I will speak)' },
            { rule: 'Same endings for -ar, -er, -ir', example: '-é, -ás, -á, -emos, -éis, -án' },
            { rule: 'Some verbs have irregular stems', example: 'tener → tendr-, hacer → har-, decir → dir-' },
          ]
        },
        {
          heading: 'Irregular Future Stems',
          items: [
            { rule: 'tener → tendr-', example: 'tendré, tendrás, tendrá...' },
            { rule: 'hacer → har-', example: 'haré, harás, hará...' },
            { rule: 'decir → dir-', example: 'diré, dirás, dirá...' },
            { rule: 'poder → podr-', example: 'podré, podrás, podrá...' },
            { rule: 'querer → querr-', example: 'querré, querrás, querrá...' },
            { rule: 'saber → sabr-', example: 'sabré, sabrás, sabrá...' },
            { rule: 'salir → saldr-', example: 'saldré, saldrás, saldrá...' },
            { rule: 'venir → vendr-', example: 'vendré, vendrás, vendrá...' },
            { rule: 'poner → pondr-', example: 'pondré, pondrás, pondrá...' },
          ]
        },
      ],
      tips: [
        'Future can also express probability: "Serán las tres" (It\'s probably 3 o\'clock)',
        'Informal speech often uses "ir a + infinitive" instead: "Voy a comer" = "Comeré"',
        'Irregular stems are the same for future AND conditional tenses',
      ]
    },

    conditional: {
      title: 'Conditional Tense',
      description: 'Used for "would" scenarios, polite requests, and hypotheticals.',
      sections: [
        {
          heading: 'Formation',
          items: [
            { rule: 'All verbs: infinitive + endings', example: 'hablar + ía = hablaría (I would speak)' },
            { rule: 'Same endings for -ar, -er, -ir', example: '-ía, -ías, -ía, -íamos, -íais, -ían' },
            { rule: 'Same irregular stems as future', example: 'tener → tendr- → tendría' },
          ]
        },
        {
          heading: 'Common Uses',
          items: [
            { rule: 'Hypothetical (would)', example: 'Yo comería paella. (I would eat paella.)' },
            { rule: 'Polite requests', example: '¿Podrías ayudarme? (Could you help me?)' },
            { rule: 'Advice/suggestions', example: 'Yo que tú, estudiaría más. (If I were you, I\'d study more.)' },
            { rule: 'Probability in the past', example: 'Serían las tres. (It was probably 3 o\'clock.)' },
            { rule: 'Si clauses (if...would)', example: 'Si tuviera dinero, viajaría. (If I had money, I would travel.)' },
          ]
        },
      ],
      tips: [
        'Conditional endings look like imperfect -er/-ir endings (-ía, -ías, etc.)',
        'Same irregular stems as future: tener→tendr-, hacer→har-, etc.',
        'Often paired with imperfect subjunctive: "Si pudiera, lo haría"',
      ]
    },

    subjunctive: {
      title: 'Subjunctive Mood',
      description: 'Used for wishes, doubts, emotions, and hypotheticals. Triggered by specific phrases.',
      sections: [
        {
          heading: 'WEIRDO Triggers',
          mnemonic: 'WEIRDO',
          items: [
            { letter: 'W', rule: 'Wishes / Wants', example: 'Quiero que vengas. (I want you to come.)' },
            { letter: 'E', rule: 'Emotions', example: 'Me alegra que estés aquí. (I\'m glad you\'re here.)' },
            { letter: 'I', rule: 'Impersonal expressions', example: 'Es importante que estudies. (It\'s important that you study.)' },
            { letter: 'R', rule: 'Recommendations / Requests', example: 'Recomiendo que comas más. (I recommend you eat more.)' },
            { letter: 'D', rule: 'Doubt / Denial', example: 'Dudo que él sepa. (I doubt he knows.)' },
            { letter: 'O', rule: 'Ojalá (God willing)', example: 'Ojalá que llueva. (I hope it rains.)' },
          ]
        },
        {
          heading: 'Formation (Present Subjunctive)',
          items: [
            { rule: '-AR verbs: opposite vowel -e', example: 'hablar → hable, hables, hable, hablemos, habléis, hablen' },
            { rule: '-ER/-IR verbs: opposite vowel -a', example: 'comer → coma, comas, coma, comamos, comáis, coman' },
            { rule: 'Start from "yo" present form', example: 'tener → tengo → tenga, tengas, tenga...' },
          ]
        },
      ],
      tips: [
        'Subjunctive needs two clauses + "que": [main clause] + que + [subjunctive clause]',
        'If both clauses have the same subject, use infinitive instead: "Quiero ir" (not "Quiero que yo vaya")',
        'Common triggers: querer que, esperar que, es necesario que, ojalá que, dudar que',
        'Indicative (facts) vs Subjunctive (non-facts): "Sé que es" vs "Dudo que sea"',
      ]
    },
  },

  // Fill-in-the-blank exercises
  exercises: {
    serVsEstar: [
      { sentence: 'Ella ___ doctora.', answer: 'es', options: ['es', 'está'], hint: 'occupation' },
      { sentence: 'Yo ___ cansado hoy.', answer: 'estoy', options: ['soy', 'estoy'], hint: 'temporary condition' },
      { sentence: 'Nosotros ___ de Colombia.', answer: 'somos', options: ['somos', 'estamos'], hint: 'origin' },
      { sentence: 'La fiesta ___ en mi casa.', answer: 'es', options: ['es', 'está'], hint: 'event location' },
      { sentence: 'Los niños ___ contentos.', answer: 'están', options: ['son', 'están'], hint: 'emotion' },
      { sentence: '___ las diez de la noche.', answer: 'Son', options: ['Son', 'Están'], hint: 'time' },
      { sentence: 'Mi hermano ___ alto y delgado.', answer: 'es', options: ['es', 'está'], hint: 'physical description' },
      { sentence: 'La comida ___ lista.', answer: 'está', options: ['es', 'está'], hint: 'condition/ready' },
      { sentence: 'Ella ___ muy inteligente.', answer: 'es', options: ['es', 'está'], hint: 'inherent trait' },
      { sentence: 'El café ___ caliente.', answer: 'está', options: ['es', 'está'], hint: 'temporary state' },
      { sentence: 'Hoy ___ lunes.', answer: 'es', options: ['es', 'está'], hint: 'day of week' },
      { sentence: 'La puerta ___ abierta.', answer: 'está', options: ['es', 'está'], hint: 'condition' },
      { sentence: 'Mis padres ___ profesores.', answer: 'son', options: ['son', 'están'], hint: 'occupation' },
      { sentence: 'Ella ___ enferma.', answer: 'está', options: ['es', 'está'], hint: 'temporary condition' },
      { sentence: 'El libro ___ de María.', answer: 'es', options: ['es', 'está'], hint: 'possession' },
      { sentence: 'El restaurante ___ cerca.', answer: 'está', options: ['es', 'está'], hint: 'location' },
      { sentence: 'Yo ___ estudiante.', answer: 'soy', options: ['soy', 'estoy'], hint: 'identity' },
      { sentence: 'Ella ___ llorando.', answer: 'está', options: ['es', 'está'], hint: 'progressive action' },
    ],

    porVsPara: [
      { sentence: 'Este regalo es ___ ti.', answer: 'para', options: ['por', 'para'], hint: 'recipient' },
      { sentence: 'Caminé ___ el parque.', answer: 'por', options: ['por', 'para'], hint: 'through' },
      { sentence: 'Estudio ___ aprender español.', answer: 'para', options: ['por', 'para'], hint: 'purpose' },
      { sentence: 'Gracias ___ tu ayuda.', answer: 'por', options: ['por', 'para'], hint: 'because of' },
      { sentence: 'Salgo ___ Madrid mañana.', answer: 'para', options: ['por', 'para'], hint: 'destination' },
      { sentence: 'Lo compré ___ veinte dólares.', answer: 'por', options: ['por', 'para'], hint: 'exchange/price' },
      { sentence: 'El informe es ___ el viernes.', answer: 'para', options: ['por', 'para'], hint: 'deadline' },
      { sentence: 'Hablo ___ teléfono.', answer: 'por', options: ['por', 'para'], hint: 'by means of' },
      { sentence: 'Trabajo ___ una empresa grande.', answer: 'para', options: ['por', 'para'], hint: 'employment' },
      { sentence: 'Estudié ___ tres horas.', answer: 'por', options: ['por', 'para'], hint: 'duration' },
      { sentence: '___ mí, es importante.', answer: 'Para', options: ['Por', 'Para'], hint: 'opinion' },
      { sentence: 'Ella habló ___ nosotros.', answer: 'por', options: ['por', 'para'], hint: 'on behalf of' },
      { sentence: '___ un niño, cocina bien.', answer: 'Para', options: ['Por', 'Para'], hint: 'comparison' },
      { sentence: 'Pagué diez euros ___ la camiseta.', answer: 'por', options: ['por', 'para'], hint: 'exchange' },
    ],

    preteriteVsImperfect: [
      { sentence: 'Ayer yo ___ al parque. (ir)', answer: 'fui', options: ['fui', 'iba'], hint: 'completed action' },
      { sentence: 'Cuando era niño, ___ mucho. (jugar)', answer: 'jugaba', options: ['jugué', 'jugaba'], hint: 'habitual past' },
      { sentence: 'Ella ___ una carta ayer. (escribir)', answer: 'escribió', options: ['escribió', 'escribía'], hint: 'completed action' },
      { sentence: 'Siempre ___ a las 7. (despertarse)', answer: 'me despertaba', options: ['me desperté', 'me despertaba'], hint: 'routine' },
      { sentence: '___ sol cuando salimos. (hacer)', answer: 'Hacía', options: ['Hizo', 'Hacía'], hint: 'background/weather' },
      { sentence: 'De repente, el teléfono ___. (sonar)', answer: 'sonó', options: ['sonó', 'sonaba'], hint: 'sudden action' },
      { sentence: 'Ella ___ muy bonita esa noche. (estar)', answer: 'estaba', options: ['estuvo', 'estaba'], hint: 'description in past' },
      { sentence: 'Yo ___ 10 años en esa época. (tener)', answer: 'tenía', options: ['tuve', 'tenía'], hint: 'age in past' },
      { sentence: 'Ellos ___ la película el martes. (ver)', answer: 'vieron', options: ['vieron', 'veían'], hint: 'specific time' },
      { sentence: 'Mientras yo ___, él llegó. (dormir)', answer: 'dormía', options: ['dormí', 'dormía'], hint: 'ongoing when interrupted' },
    ],

    subjunctive: [
      { sentence: 'Quiero que tú ___ la verdad. (decir)', answer: 'digas', options: ['dices', 'digas'], hint: 'wish/want' },
      { sentence: 'Es importante que ___ español. (estudiar, tú)', answer: 'estudies', options: ['estudias', 'estudies'], hint: 'impersonal expression' },
      { sentence: 'Dudo que él ___ tiempo. (tener)', answer: 'tenga', options: ['tiene', 'tenga'], hint: 'doubt' },
      { sentence: 'Espero que ___ buen tiempo. (hacer)', answer: 'haga', options: ['hace', 'haga'], hint: 'hope/wish' },
      { sentence: 'Ojalá que ___ a la fiesta. (venir, ellos)', answer: 'vengan', options: ['vienen', 'vengan'], hint: 'ojalá' },
      { sentence: 'Me alegra que ___ aquí. (estar, tú)', answer: 'estés', options: ['estás', 'estés'], hint: 'emotion' },
      { sentence: 'No creo que ___ posible. (ser)', answer: 'sea', options: ['es', 'sea'], hint: 'denial' },
      { sentence: 'Recomiendo que ___ más agua. (beber, tú)', answer: 'bebas', options: ['bebes', 'bebas'], hint: 'recommendation' },
      { sentence: 'Es necesario que ___ temprano. (llegar, nosotros)', answer: 'lleguemos', options: ['llegamos', 'lleguemos'], hint: 'impersonal expression' },
      { sentence: 'Temo que no ___ listos. (estar, ellos)', answer: 'estén', options: ['están', 'estén'], hint: 'fear/emotion' },
    ],
  },
};
