// 1. translation dictionary
const translations = {
  en: {
    title: "Protein Drink Tracker",
    proteinFoodListBtn: "List of Protein Food (Natural)",
    btnDrank: "I drank my protein",
    btnDrankUndo: "Undo",
    statusDone: "Protein done for today.",
    statusNotDone: "Not yet today.",
    statusStreak: "day streak!",
    localTime: "Local Time", // Main clock label
    lastDrankLabel: "Last drank at", // Label for last drank time
    // Protein Food Page
    proteinSourcesTitle: "Protein Sources",
    proteinFoodPageTitle: "Top Natural Protein Foods (per 100g)",
    backToTracker: "← Back to Tracker",
    proteinLabel: "Protein (g)",
    proteinContent: "Protein Content (grams)",
    foods: {
      soybeans: "Soybeans",
      chickenBreast: "Chicken Breast",
      peanutButter: "Peanut Butter",
      almonds: "Almonds",
      paneer: "Paneer",
      eggs: "Eggs",
      greekYogurt: "Greek Yogurt",
      lentils: "Lentils",
    },
    motivationalQuotes: [
      "Stay strong! 💪",
      "Consistency is key! 🔑",
      "One sip at a time! 🥤",
      "Fuel your body! ⚡",
      "You're doing great! 🌟",
      "Hydrate and thrive! 💧",
      "Keep the streak alive! 🔥",
      "Protein power! 🏋️‍♂️",
    ],
  },
  fr: {
    title: "Suivi de Protéines",
    proteinFoodListBtn: "Liste des aliments protéinés (naturels)",
    btnDrank: "J'ai bu ma protéine",
    btnDrankUndo: "Défaire",
    statusDone: "Protéine prise aujourd'hui.",
    statusNotDone: "Pas encore aujourd'hui.",
    statusStreak: "jour(s) consécutif(s)!",
    localTime: "Heure locale", // Main clock label
    lastDrankLabel: "Dernier bu à", // Label for last drank time
    // Protein Food Page
    proteinSourcesTitle: "Sources de Protéines",
    proteinFoodPageTitle:
      "Meilleurs Aliments Naturels Riches en Protéines (par 100g)",
    backToTracker: "← Retour au Suivi",
    proteinLabel: "Protéine (g)",
    proteinContent: "Contenu en Protéines (grammes)",
    foods: {
      soybeans: "Soja",
      chickenBreast: "Poitrine de Poulet",
      peanutButter: "Beurre d'Arachide",
      almonds: "Amandes",
      paneer: "Paneer",
      eggs: "Œufs",
      greekYogurt: "Yaourt Grec",
      lentils: "Lentilles",
    },
    motivationalQuotes: [
      "Tiens bon ! 💪",
      "La régularité est la clé ! 🔑",
      "Une gorgée à la fois ! 🥤",
      "Nourris ton corps ! ⚡",
      "Tu te débrouilles super bien ! 🌟",
      "Hydrate-toi et sois au top ! 💧",
      "Continue sur ta lancée ! 🔥",
      "La force des protéines ! 🏋️‍♂️",
    ],
  },
  nl: {
    title: "Eiwitdrank Tracker",
    proteinFoodListBtn: "Lijst met eiwitrijke voedingsmiddelen (natuurlijk)",
    btnDrank: "Ik heb mijn eiwit gedronken",
    btnDrankUndo: "Ongedaan maken",
    statusDone: "Eiwit voor vandaag gedronken.",
    statusNotDone: "Nog niet vandaag.",
    statusStreak: "dag(en) op rij!",
    localTime: "Lokale tijd", // Main clock label
    lastDrankLabel: "Laatste gedronken om", // Label for last drank time
    // Protein Food Page
    proteinSourcesTitle: "Eiwitbronnen",
    proteinFoodPageTitle:
      "Beste Natuurlijke Eiwitrijke Voedingsmiddelen (per 100g)",
    backToTracker: "← Terug naar Tracker",
    proteinLabel: "Eiwit (g)",
    proteinContent: "Eiwitgehalte (grammen)",
    foods: {
      soybeans: "Soja",
      chickenBreast: "Kipfilet",
      peanutButter: "Arachidepasta",
      almonds: "Amandelen",
      paneer: "Paneer",
      eggs: "Eieren",
      greekYogurt: "Griekse Yoghurt",
      lentils: "Linzen",
    },
    motivationalQuotes: [
      "Blijf sterk! 💪",
      "Consistentie is de sleutel! 🔑",
      "Eén slokje per keer! 🥤",
      "Geef je lichaam de brandstof! ⚡",
      "Je doet het geweldig! 🌟",
      "Hydrateer en bloei! 💧",
      "Houd de reeks levend! 🔥",
      "Eiwitkracht! 🏋️‍♂️",
    ],
  },
  ar: {
    title: "متعقب مشروب البروتين",
    proteinFoodListBtn: "قائمة الأطعمة البروتينية (الطبيعية)", // TODO: verify this translation
    btnDrank: "شربت بروتيني",
    btnDrankUndo: "تراجع",
    statusDone: "تم شرب البروتين اليوم.",
    statusNotDone: "لم يتم الشرب بعد اليوم.",
    statusStreak: "يوم متتالي!",
    localTime: "التوقيت المحلي", // Main clock label // TODO: verify this translation
    lastDrankLabel: "آخر مشروب في", // Label for last drank time // TODO: verify this translation
    // Protein Food Page
    proteinSourcesTitle: "مصادر البروتين",
    proteinFoodPageTitle:
      "أفضل الأطعمة الطبيعية الغنية بالبروتين (لكل 100 جرام)",
    backToTracker: "← العودة إلى المتعقب",
    proteinLabel: "بروتين (جرام)",
    proteinContent: "محتوى البروتين (بالجرام)",
    foods: {
      soybeans: "فول الصويا",
      chickenBreast: "صدر الدجاج",
      peanutButter: "زبدة الفول السوداني",
      almonds: "اللوز",
      paneer: "جبن بانير",
      eggs: "البيض",
      greekYogurt: "الزبادي اليوناني",
      lentils: "العدس",
    },
    motivationalQuotes: [
      //TODO: verify these translations
      "ابقَ قويًا! 💪",
      "الاستمرارية هي سر النجاح! 🔑",
      "رشفة تلو الأخرى! 🥤",
      "غذِّ جسمك! ⚡",
      "أنت رائع! 🌟",
      "اشرب الماء بكثرة وازدهر! 💧",
      "حافظ على سلسلة انتصاراتك! 🔥",
      "قوة البروتين! 🏋️‍♂️",
    ],
  },
  tr: {
    title: "Proteinli İçecek Takipçisi",
    proteinFoodListBtn: "Protein İçeren Gıdalar Listesi (Doğal)", // TODO: verify this translation
    btnDrank: "Proteinimi içtim",
    btnDrankUndo: "Geri al",
    statusDone: "Bugünkü protein içildi.",
    statusNotDone: "Bugün henüz protein içilmedi.",
    statusStreak: "günlük seri!",
    localTime: "Yerel Saat", // Main clock label // TODO: verify this translation
    lastDrankLabel: "En son şu tarihte içildi", // Label for last drank time // TODO: verify this translation
    // Protein Food Page
    proteinSourcesTitle: "Protein Kaynakları",
    proteinFoodPageTitle:
      "En İyi Doğal Protein Açısından Zengin Gıdalar (100g başına)",
    backToTracker: "← Takipçiye Geri Dön",
    proteinLabel: "Protein (g)",
    proteinContent: "Protein İçeriği (gramlar)",
    foods: {
      soybeans: "Soya Fasulyesi",
      chickenBreast: "Tavuk Göğsü",
      peanutButter: "Fıstık Ezmesi",
      almonds: "Badem",
      paneer: "Paneer",
      eggs: "Yumurta",
      greekYogurt: "Yunan Yoğurdu",
      lentils: "Mercimek",
    },
    motivationalQuotes: [
      //TODO: verify these translations
      "Güçlü kal! 💪",
      "Tutarlılık çok önemli! 🔑",
      "Bir yudumda iç! 🥤",
      "Vücuduna enerji ver! ⚡",
      "Harika gidiyorsun! 🌟",
      "Su iç ve geliş! 💧",
      "Seriyi devam ettir! 🔥",
      "Protein gücü! 🏋️‍♂️",
    ],
  },
  es: {
    title: "Registro de Bebida de Proteína",
    proteinFoodListBtn: "Lista de Alimentos con Proteína (Naturales)",
    btnDrank: "Bebí mi proteína",
    btnDrankUndo: "Deshacer",
    statusDone: "Proteína completada por hoy.",
    statusNotDone: "Aún no por hoy.",
    statusStreak: "¡días de racha!",
    localTime: "Hora Local", // Etiqueta principal del reloj
    lastDrankLabel: "Última vez que bebiste", // Etiqueta de la última vez
    // Protein Food Page
    proteinSourcesTitle: "Fuentes de Proteína",
    proteinFoodPageTitle: "Top Alimentos Naturales con Proteína (por 100g)",
    backToTracker: "← Volver al Rastreador",
    proteinLabel: "Proteína (g)",
    proteinContent: "Contenido de Proteína (gramos)",
    foods: {
      soybeans: "Soja",
      chickenBreast: "Pechuga de Pollo",
      peanutButter: "Mantequilla de Maní",
      almonds: "Almendras",
      paneer: "Queso Paneer",
      eggs: "Huevos",
      greekYogurt: "Yogur Griego",
      lentils: "Lentejas",
    },
    motivationalQuotes: [
      "¡Mantente fuerte! 💪",
      "¡La constancia es la clave! 🔑",
      "¡Un sorbo a la vez! 🥤",
      "¡Dale energía a tu cuerpo! ⚡",
      "¡Lo estás haciendo genial! 🌟",
      "¡Hidrátate y progresa! 💧",
      "¡Mantén la racha viva! 🔥",
      "¡Poder de proteína! 🏋️‍♂️",
    ],
  },
  it: {
    title: "Tracker Proteine",
    proteinFoodListBtn: "Alimenti Proteici (Naturali)",
    btnDrank: "Ho bevuto le mie proteine",
    btnDrankUndo: "Annulla",
    statusDone: "Proteine assunte per oggi.",
    statusNotDone: "Non ancora oggi.",
    statusStreak: "giorni di fila!",
    localTime: "Ora Locale", // Main clock label
    lastDrankLabel: "Ultima assunzione alle", // Label for last drank time
    // Protein Food Page
    proteinSourcesTitle: "Fonti di Proteine",
    proteinFoodPageTitle: "Migliori Alimenti Proteici Naturali (per 100g)",
    backToTracker: "← Torna al Tracker",
    proteinLabel: "Proteine (g)",
    proteinContent: "Contenuto Proteico (grammi)",
    foods: {
      soybeans: "Soia",
      chickenBreast: "Petto di Pollo",
      peanutButter: "Burro di Arachidi",
      almonds: "Mandorle",
      paneer: "Paneer",
      eggs: "Uova",
      greekYogurt: "Yogurt Greco",
      lentils: "Lenticchie",
    },
    motivationalQuotes: [
      "Rimani forte! 💪",
      "La costanza è la chiave! 🔑",
      "Un sorso alla volta! 🥤",
      "Dai energia al tuo corpo! ⚡",
      "Stai andando alla grande! 🌟",
      "Idratati e prospera! 💧",
      "Mantieni la serie! 🔥",
      "Potenza proteica! 🏋️‍♂️",
    ],
  },
};
