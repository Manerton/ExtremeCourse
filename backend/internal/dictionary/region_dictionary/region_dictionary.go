package region_dictionary

// RegionID — тип для кода региона (взято из автокодов)
type RegionID int

const (
	RegionAdygea                      RegionID = 1 // Адыгея
	RegionBashkortostan               RegionID = 2 // Башкортостан
	RegionBuryatia                    RegionID = 3 // Бурятия
	RegionAltaiRepublic               RegionID = 4 // Республика Алтай
	RegionDagestan                    RegionID = 5 // Дагестан
	RegionIngushetia                  RegionID = 6
	RegionKabardinoBalkaria           RegionID = 7
	RegionKalmykia                    RegionID = 8
	RegionKarachayCherkessia          RegionID = 9
	RegionKarelia                     RegionID = 10
	RegionKomi                        RegionID = 11
	RegionMariEl                      RegionID = 12
	RegionMordovia                    RegionID = 13
	RegionSakha                       RegionID = 14 // Якутия
	RegionNorthOssetia                RegionID = 15
	RegionTatarstan                   RegionID = 16
	RegionTuva                        RegionID = 17
	RegionUdmurtia                    RegionID = 18
	RegionKhakassia                   RegionID = 19
	RegionChechenRepublic             RegionID = 95 // Чечня (код 95)
	RegionChuvashia                   RegionID = 21 // +121 у Чувашии
	RegionAltaiKrai                   RegionID = 22
	RegionKrasnodarKrai               RegionID = 23
	RegionKrasnoyarskKrai             RegionID = 24
	RegionPrimorskyKrai               RegionID = 25
	RegionStavropolKrai               RegionID = 26
	RegionKhabarovskKrai              RegionID = 27
	RegionAmurOblast                  RegionID = 28
	RegionArkhangelskOblast           RegionID = 29
	RegionAstrakhanOblast             RegionID = 30
	RegionBelgorodOblast              RegionID = 31
	RegionBryanskOblast               RegionID = 32
	RegionVladimirOblast              RegionID = 33
	RegionVolgogradOblast             RegionID = 34
	RegionVologdaOblast               RegionID = 35
	RegionVoronezhOblast              RegionID = 36
	RegionIvanovoOblast               RegionID = 37
	RegionIrkutskOblast               RegionID = 38
	RegionKaliningradOblast           RegionID = 39
	RegionKalugaOblast                RegionID = 40
	RegionKamchatkaKrai               RegionID = 41
	RegionKemerovoOblast              RegionID = 42
	RegionKirovOblast                 RegionID = 43
	RegionKostromaOblast              RegionID = 44
	RegionKurganOblast                RegionID = 45
	RegionKurskOblast                 RegionID = 46
	RegionLeningradOblast             RegionID = 47
	RegionLipetskOblast               RegionID = 48
	RegionMagadanOblast               RegionID = 49
	RegionMoscowOblast                RegionID = 50
	RegionMurmanskOblast              RegionID = 51
	RegionNizhnyNovgorodOblast        RegionID = 52
	RegionNovgorodOblast              RegionID = 53
	RegionNovosibirskOblast           RegionID = 54
	RegionOmskOblast                  RegionID = 55
	RegionOrenburgOblast              RegionID = 56
	RegionOryolOblast                 RegionID = 57
	RegionPenzaOblast                 RegionID = 58
	RegionPermKrai                    RegionID = 59
	RegionPskovOblast                 RegionID = 60
	RegionRostovOblast                RegionID = 61
	RegionRyazanOblast                RegionID = 62
	RegionSamaraOblast                RegionID = 63
	RegionSaratovOblast               RegionID = 64
	RegionSakhalinOblast              RegionID = 65
	RegionSverdlovskOblast            RegionID = 66
	RegionSmolenskOblast              RegionID = 67
	RegionTambovOblast                RegionID = 68
	RegionTverOblast                  RegionID = 69
	RegionTomskOblast                 RegionID = 70
	RegionTulaOblast                  RegionID = 71
	RegionTyumenOblast                RegionID = 72
	RegionUlyanovskOblast             RegionID = 73
	RegionChelyabinskOblast           RegionID = 74
	RegionZabaykalskyKrai             RegionID = 75
	RegionYaroslavlOblast             RegionID = 76
	RegionMoscowCity                  RegionID = 77
	RegionSaintPetersburg             RegionID = 78
	RegionJewishAutonomousOblast      RegionID = 79
	RegionNenetsAutonomousOkrug       RegionID = 83
	RegionKhantyMansiAutonomousOkrug  RegionID = 86
	RegionChukotkaAutonomousOkrug     RegionID = 87
	RegionYamaloNenetsAutonomousOkrug RegionID = 89
	RegionSevastopol                  RegionID = 92
)

// RegionNames — карта из RegionID в читаемое имя региона
var RegionNames = map[RegionID]string{
	RegionAdygea:                      "Республика Адыгея",
	RegionBashkortostan:               "Республика Башкортостан",
	RegionBuryatia:                    "Республика Бурятия",
	RegionAltaiRepublic:               "Республика Алтай",
	RegionDagestan:                    "Республика Дагестан",
	RegionIngushetia:                  "Республика Ингушетия",
	RegionKabardinoBalkaria:           "Кабардино-Балкарская Республика",
	RegionKalmykia:                    "Республика Калмыкия",
	RegionKarachayCherkessia:          "Карачаево-Черкесская Республика",
	RegionKarelia:                     "Республика Карелия",
	RegionKomi:                        "Республика Коми",
	RegionMariEl:                      "Республика Марий Эл",
	RegionMordovia:                    "Республика Мордовия",
	RegionSakha:                       "Республика Саха (Якутия)",
	RegionNorthOssetia:                "Республика Северная Осетия — Алания",
	RegionTatarstan:                   "Республика Татарстан",
	RegionTuva:                        "Республика Тыва",
	RegionUdmurtia:                    "Удмуртская Республика",
	RegionKhakassia:                   "Республика Хакасия",
	RegionChechenRepublic:             "Чеченская Республика",
	RegionChuvashia:                   "Чувашская Республика — Чувашия",
	RegionAltaiKrai:                   "Алтайский край",
	RegionKrasnodarKrai:               "Краснодарский край",
	RegionKrasnoyarskKrai:             "Красноярский край",
	RegionPrimorskyKrai:               "Приморский край",
	RegionStavropolKrai:               "Ставропольский край",
	RegionKhabarovskKrai:              "Хабаровский край",
	RegionAmurOblast:                  "Амурская область",
	RegionArkhangelskOblast:           "Архангельская область",
	RegionAstrakhanOblast:             "Астраханская область",
	RegionBelgorodOblast:              "Белгородская область",
	RegionBryanskOblast:               "Брянская область",
	RegionVladimirOblast:              "Владимирская область",
	RegionVolgogradOblast:             "Волгоградская область",
	RegionVologdaOblast:               "Вологодская область",
	RegionVoronezhOblast:              "Воронежская область",
	RegionIvanovoOblast:               "Ивановская область",
	RegionIrkutskOblast:               "Иркутская область",
	RegionKaliningradOblast:           "Калининградская область",
	RegionKalugaOblast:                "Калужская область",
	RegionKamchatkaKrai:               "Камчатский край",
	RegionKemerovoOblast:              "Кемеровская область",
	RegionKirovOblast:                 "Кировская область",
	RegionKostromaOblast:              "Костромская область",
	RegionKurganOblast:                "Курганская область",
	RegionKurskOblast:                 "Курская область",
	RegionLeningradOblast:             "Ленинградская область",
	RegionLipetskOblast:               "Липецкая область",
	RegionMagadanOblast:               "Магаданская область",
	RegionMoscowOblast:                "Московская область",
	RegionMurmanskOblast:              "Мурманская область",
	RegionNizhnyNovgorodOblast:        "Нижегородская область",
	RegionNovgorodOblast:              "Новгородская область",
	RegionNovosibirskOblast:           "Новосибирская область",
	RegionOmskOblast:                  "Омская область",
	RegionOrenburgOblast:              "Оренбургская область",
	RegionOryolOblast:                 "Орловская область",
	RegionPenzaOblast:                 "Пензенская область",
	RegionPermKrai:                    "Пермский край",
	RegionPskovOblast:                 "Псковская область",
	RegionRostovOblast:                "Ростовская область",
	RegionRyazanOblast:                "Рязанская область",
	RegionSamaraOblast:                "Самарская область",
	RegionSaratovOblast:               "Саратовская область",
	RegionSakhalinOblast:              "Сахалинская область",
	RegionSverdlovskOblast:            "Свердловская область",
	RegionSmolenskOblast:              "Смоленская область",
	RegionTambovOblast:                "Тамбовская область",
	RegionTverOblast:                  "Тверская область",
	RegionTomskOblast:                 "Томская область",
	RegionTulaOblast:                  "Тульская область",
	RegionTyumenOblast:                "Тюменская область",
	RegionUlyanovskOblast:             "Ульяновская область",
	RegionChelyabinskOblast:           "Челябинская область",
	RegionZabaykalskyKrai:             "Забайкальский край",
	RegionYaroslavlOblast:             "Ярославская область",
	RegionMoscowCity:                  "Москва (город)",
	RegionSaintPetersburg:             "Санкт-Петербург",
	RegionJewishAutonomousOblast:      "Еврейская автономная область",
	RegionNenetsAutonomousOkrug:       "Ненецкий автономный округ",
	RegionKhantyMansiAutonomousOkrug:  "Ханты-Мансийский автономный округ",
	RegionChukotkaAutonomousOkrug:     "Чукотский автономный округ",
	RegionYamaloNenetsAutonomousOkrug: "Ямало-Ненецкий автономный округ",
	RegionSevastopol:                  "Севастополь",
}
