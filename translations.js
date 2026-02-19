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
        motivationalQuotes: [
            "Stay strong! 💪",
            "Consistency is key! 🔑",
            "One sip at a time! 🥤",
            "Fuel your body! ⚡",
            "You're doing great! 🌟",
            "Hydrate and thrive! 💧",
            "Keep the streak alive! 🔥",
            "Protein power! 🏋️‍♂️"
        ]
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
        motivationalQuotes: [
            "Tiens bon ! 💪",
            "La régularité est la clé ! 🔑",
            "Une gorgée à la fois ! 🥤",
            "Nourris ton corps ! ⚡",
            "Tu te débrouilles super bien ! 🌟",
            "Hydrate-toi et sois au top ! 💧",
            "Continue sur ta lancée ! 🔥",
            "La force des protéines ! 🏋️‍♂️"
        ]
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
        motivationalQuotes: [
            "Blijf sterk! 💪",
            "Consistentie is de sleutel! 🔑",
            "Eén slokje per keer! 🥤",
            "Geef je lichaam de brandstof! ⚡",
            "Je doet het geweldig! 🌟",
            "Hydrateer en bloei! 💧",
            "Houd de reeks levend! 🔥",
            "Eiwitkracht! 🏋️‍♂️"
        ]
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
        motivationalQuotes: [ //TODO: verify these translations
            "ابقَ قويًا! 💪",
            "الاستمرارية هي سر النجاح! 🔑",
            "رشفة تلو الأخرى! 🥤",
            "غذِّ جسمك! ⚡",
            "أنت رائع! 🌟",
            "اشرب الماء بكثرة وازدهر! 💧",
            "حافظ على سلسلة انتصاراتك! 🔥",
            "قوة البروتين! 🏋️‍♂️"
        ]
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
        motivationalQuotes: [ //TODO: verify these translations
            "Güçlü kal! 💪",
            "Tutarlılık çok önemli! 🔑",
            "Bir yudumda iç! 🥤",
            "Vücuduna enerji ver! ⚡",
            "Harika gidiyorsun! 🌟",
            "Su iç ve geliş! 💧",
            "Seriyi devam ettir! 🔥",
            "Protein gücü! 🏋️‍♂️"
        ]
    },
  };