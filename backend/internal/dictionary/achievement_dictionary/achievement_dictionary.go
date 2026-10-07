package achievement_dictionary

type AchievementType string

// Базовые олимпиады
const (
	AchievementMaxwellWinner         AchievementType = "MAXWELL_WINNER"
	AchievementMaxwellPrizeWinner    AchievementType = "MAXWELL_PRIZE_WINNER"
	AchievementEulerWinner           AchievementType = "EULER_WINNER"
	AchievementEulerPrizeWinner      AchievementType = "EULER_PRIZE_WINNER"
	AchievementVsoshMunWinner        AchievementType = "VSOSH_MUN_WINNER"
	AchievementVsoshMunPrizeWinner   AchievementType = "VSOSH_MUN_PRIZE_WINNER"
	AchievementVsoshRegWinner        AchievementType = "VSOSH_REG_WINNER"
	AchievementVsoshRegPrizeWinner   AchievementType = "VSOSH_REG_PRIZE_WINNER"
	AchievementMinobrListWinner      AchievementType = "MINOBR_LIST_WINNER"
	AchievementMinobrListPrizeWinner AchievementType = "MINOBR_LIST_PRIZE_WINNER"
	AchievementMathMunWinner         AchievementType = "MATH_MUN_WINNER"
	AchievementMathMunPrizeWinner    AchievementType = "MATH_MUN_PRIZE_WINNER"
	AchievementMathRegWinner         AchievementType = "MATH_REG_WINNER"
	AchievementMathRegPrizeWinner    AchievementType = "MATH_REG_PRIZE_WINNER"
)

// Олимпиады из Перечня Минобрнауки по профилям: Математика, Физика, Биология, Экономика, Химия, Информатика
const (
	// № 1
	AchievementFinatlonWinner      AchievementType = "FINATLON_WINNER"
	AchievementFinatlonPrizeWinner AchievementType = "FINATLON_PRIZE_WINNER"
	// № 2
	AchievementFormulaEdinstvaWinner      AchievementType = "FORMULA_EDINSTVA_WINNER"
	AchievementFormulaEdinstvaPrizeWinner AchievementType = "FORMULA_EDINSTVA_PRIZE_WINNER"
	// № 4
	AchievementVernadskyWinner      AchievementType = "VERNADSKY_WINNER"
	AchievementVernadskyPrizeWinner AchievementType = "VERNADSKY_PRIZE_WINNER"
	// № 5
	AchievementNtoWinner      AchievementType = "NTO_WINNER"
	AchievementNtoPrizeWinner AchievementType = "NTO_PRIZE_WINNER"
	// № 6
	AchievementInnagrikaWinner      AchievementType = "INNAGRIKA_WINNER"
	AchievementInnagrikaPrizeWinner AchievementType = "INNAGRIKA_PRIZE_WINNER"
	// № 7
	AchievementVsoshAiWinner      AchievementType = "VSOSH_AI_WINNER"
	AchievementVsoshAiPrizeWinner AchievementType = "VSOSH_AI_PRIZE_WINNER"
	// № 8
	AchievementVysshayaProbaWinner      AchievementType = "VYSSHAYA_PROBA_WINNER"
	AchievementVysshayaProbaPrizeWinner AchievementType = "VYSSHAYA_PROBA_PRIZE_WINNER"
	// № 9
	AchievementMissiyaVypolnimaWinner      AchievementType = "MISSIYA_VYPOLNIMA_WINNER"
	AchievementMissiyaVypolnimaPrizeWinner AchievementType = "MISSIYA_VYPOLNIMA_PRIZE_WINNER"
	// № 11
	AchievementSechenovWinner      AchievementType = "SECHENOV_WINNER"
	AchievementSechenovPrizeWinner AchievementType = "SECHENOV_PRIZE_WINNER"
	// № 14
	AchievementVsesibirskayaWinner      AchievementType = "VSESIBIRSKAYA_WINNER"
	AchievementVsesibirskayaPrizeWinner AchievementType = "VSESIBIRSKAYA_PRIZE_WINNER"
	// № 15
	AchievementVuzAkademInformatikaWinner      AchievementType = "VUZ_AKADEM_INFORMATIKA_WINNER"
	AchievementVuzAkademInformatikaPrizeWinner AchievementType = "VUZ_AKADEM_INFORMATIKA_PRIZE_WINNER"
	// № 17
	AchievementGorodskayaFizikaWinner      AchievementType = "GORODSKAYA_FIZIKA_WINNER"
	AchievementGorodskayaFizikaPrizeWinner AchievementType = "GORODSKAYA_FIZIKA_PRIZE_WINNER"
	// № 18
	AchievementInzhenernayaWinner      AchievementType = "INZHENERNAYA_WINNER"
	AchievementInzhenernayaPrizeWinner AchievementType = "INZHENERNAYA_PRIZE_WINNER"
	// № 19
	AchievementInternetFizikaWinner      AchievementType = "INTERNET_FIZIKA_WINNER"
	AchievementInternetFizikaPrizeWinner AchievementType = "INTERNET_FIZIKA_PRIZE_WINNER"
	// № 22
	AchievementInnopolisOpenWinner      AchievementType = "INNOPOLIS_OPEN_WINNER"
	AchievementInnopolisOpenPrizeWinner AchievementType = "INNOPOLIS_OPEN_PRIZE_WINNER"
	// № 23
	AchievementFinSafetyWinner      AchievementType = "FIN_SAFETY_WINNER"
	AchievementFinSafetyPrizeWinner AchievementType = "FIN_SAFETY_PRIZE_WINNER"
	// № 26
	AchievementIzumrudWinner      AchievementType = "IZUMRUD_WINNER"
	AchievementIzumrudPrizeWinner AchievementType = "IZUMRUD_PRIZE_WINNER"
	// № 29
	AchievementBibnWinner      AchievementType = "BIBN_WINNER"
	AchievementBibnPrizeWinner AchievementType = "BIBN_PRIZE_WINNER"
	// № 31
	AchievementVerchenkoWinner      AchievementType = "VERCHENKO_WINNER"
	AchievementVerchenkoPrizeWinner AchievementType = "VERCHENKO_PRIZE_WINNER"
	// № 32
	AchievementVedomstvennyeWinner      AchievementType = "VEDOMSTVENNYE_WINNER"
	AchievementVedomstvennyePrizeWinner AchievementType = "VEDOMSTVENNYE_PRIZE_WINNER"
	// № 33
	AchievementSarkisovWinner      AchievementType = "SARKISOV_WINNER"
	AchievementSarkisovPrizeWinner AchievementType = "SARKISOV_PRIZE_WINNER"
	// № 34
	AchievementKfuPredmetnyeWinner      AchievementType = "KFU_PREDMETNYE_WINNER"
	AchievementKfuPredmetnyePrizeWinner AchievementType = "KFU_PREDMETNYE_PRIZE_WINNER"
	// № 35
	AchievementYunyeTalantyWinner      AchievementType = "YUNYE_TALANTY_WINNER"
	AchievementYunyeTalantyPrizeWinner AchievementType = "YUNYE_TALANTY_PRIZE_WINNER"
	// № 37
	AchievementMoshWinner      AchievementType = "MOSH_WINNER"
	AchievementMoshPrizeWinner AchievementType = "MOSH_PRIZE_WINNER"
	// № 41
	AchievementOmmoWinner      AchievementType = "OMMO_WINNER"
	AchievementOmmoPrizeWinner AchievementType = "OMMO_PRIZE_WINNER"
	// № 43
	AchievementKurchatovWinner      AchievementType = "KURCHATOV_WINNER"
	AchievementKurchatovPrizeWinner AchievementType = "KURCHATOV_PRIZE_WINNER"
	// № 46
	AchievementPotomkiMendeleevaWinner      AchievementType = "POTOMKI_MENDELEEVA_WINNER"
	AchievementPotomkiMendeleevaPrizeWinner AchievementType = "POTOMKI_MENDELEEVA_PRIZE_WINNER"
	// № 47
	AchievementSibiriadaWinner      AchievementType = "SIBIRIADA_WINNER"
	AchievementSibiriadaPrizeWinner AchievementType = "SIBIRIADA_PRIZE_WINNER"
	// № 49
	AchievementGranitNaukiWinner      AchievementType = "GRANIT_NAUKI_WINNER"
	AchievementGranitNaukiPrizeWinner AchievementType = "GRANIT_NAUKI_PRIZE_WINNER"
	// № 50
	AchievementLomonosovWinner      AchievementType = "LOMONOSOV_WINNER"
	AchievementLomonosovPrizeWinner AchievementType = "LOMONOSOV_PRIZE_WINNER"
	// № 51
	AchievementNadezhdaEnergetikiWinner      AchievementType = "NADEZHDA_ENERGETIKI_WINNER"
	AchievementNadezhdaEnergetikiPrizeWinner AchievementType = "NADEZHDA_ENERGETIKI_PRIZE_WINNER"
	// № 52
	AchievementPokoriVorobyovyWinner      AchievementType = "POKORI_VOROBYOVY_WINNER"
	AchievementPokoriVorobyovyPrizeWinner AchievementType = "POKORI_VOROBYOVY_PRIZE_WINNER"
	// № 53
	AchievementRobofestWinner      AchievementType = "ROBOFEST_WINNER"
	AchievementRobofestPrizeWinner AchievementType = "ROBOFEST_PRIZE_WINNER"
	// № 54
	AchievementFiztekhWinner      AchievementType = "FIZTEKH_WINNER"
	AchievementFiztekhPrizeWinner AchievementType = "FIZTEKH_PRIZE_WINNER"
	// № 55
	AchievementShagVBuduscheeWinner      AchievementType = "SHAG_V_BUDUSCHEE_WINNER"
	AchievementShagVBuduscheePrizeWinner AchievementType = "SHAG_V_BUDUSCHEE_PRIZE_WINNER"
	// № 56
	AchievementOshipWinner      AchievementType = "OSHIP_WINNER"
	AchievementOshipPrizeWinner AchievementType = "OSHIP_PRIZE_WINNER"
	// № 57
	AchievementTehnokubokWinner      AchievementType = "TEHNOKUBOK_WINNER"
	AchievementTehnokubokPrizeWinner AchievementType = "TEHNOKUBOK_PRIZE_WINNER"
	// № 58
	AchievementRanhigsWinner      AchievementType = "RANHIGS_WINNER"
	AchievementRanhigsPrizeWinner AchievementType = "RANHIGS_PRIZE_WINNER"
	// № 59
	AchievementSpbguWinner      AchievementType = "SPBGU_WINNER"
	AchievementSpbguPrizeWinner AchievementType = "SPBGU_PRIZE_WINNER"
	// № 61
	AchievementYumshWinner      AchievementType = "YUMSH_WINNER"
	AchievementYumshPrizeWinner AchievementType = "YUMSH_PRIZE_WINNER"
	// № 62
	AchievementBuduscheeSibiriWinner      AchievementType = "BUDUSCHEE_SIBIRI_WINNER"
	AchievementBuduscheeSibiriPrizeWinner AchievementType = "BUDUSCHEE_SIBIRI_PRIZE_WINNER"
	// № 64
	AchievementOtkrytayaItmoWinner      AchievementType = "OTKRYTAYA_ITMO_WINNER"
	AchievementOtkrytayaItmoPrizeWinner AchievementType = "OTKRYTAYA_ITMO_PRIZE_WINNER"
	// № 65
	AchievementOtkrytayaProgWinner      AchievementType = "OTKRYTAYA_PROG_WINNER"
	AchievementOtkrytayaProgPrizeWinner AchievementType = "OTKRYTAYA_PROG_PRIZE_WINNER"
	// № 66
	AchievementKognitivnyeTehWinner      AchievementType = "KOGNITIVNYE_TEH_WINNER"
	AchievementKognitivnyeTehPrizeWinner AchievementType = "KOGNITIVNYE_TEH_PRIZE_WINNER"
	// № 67
	AchievementOrmoWinner      AchievementType = "ORMO_WINNER"
	AchievementOrmoPrizeWinner AchievementType = "ORMO_PRIZE_WINNER"
	// № 68
	AchievementOtkrytayaHimichWinner      AchievementType = "OTKRYTAYA_HIMICH_WINNER"
	AchievementOtkrytayaHimichPrizeWinner AchievementType = "OTKRYTAYA_HIMICH_PRIZE_WINNER"
	// № 69
	AchievementGazpromWinner      AchievementType = "GAZPROM_WINNER"
	AchievementGazpromPrizeWinner AchievementType = "GAZPROM_PRIZE_WINNER"
	// № 70
	AchievementRosatomWinner      AchievementType = "ROSATOM_WINNER"
	AchievementRosatomPrizeWinner AchievementType = "ROSATOM_PRIZE_WINNER"
	// № 71
	AchievementPirogovWinner      AchievementType = "PIROGOV_WINNER"
	AchievementPirogovPrizeWinner AchievementType = "PIROGOV_PRIZE_WINNER"
	// № 74
	AchievementSpbAstronWinner      AchievementType = "SPB_ASTRON_WINNER"
	AchievementSpbAstronPrizeWinner AchievementType = "SPB_ASTRON_PRIZE_WINNER"
	// № 75
	AchievementSpbOlimpiadaWinner      AchievementType = "SPB_OLIMPIADA_WINNER"
	AchievementSpbOlimpiadaPrizeWinner AchievementType = "SPB_OLIMPIADA_PRIZE_WINNER"
	// № 79
	AchievementTvoyPutVNaukuWinner      AchievementType = "TVOY_PUT_V_NAUKU_WINNER"
	AchievementTvoyPutVNaukuPrizeWinner AchievementType = "TVOY_PUT_V_NAUKU_PRIZE_WINNER"
	// № 81
	AchievementTurnirGorodovWinner      AchievementType = "TURNIR_GORODOV_WINNER"
	AchievementTurnirGorodovPrizeWinner AchievementType = "TURNIR_GORODOV_PRIZE_WINNER"
	// № 82
	AchievementTurnirLomonosovaWinner      AchievementType = "TURNIR_LOMONOSOVA_WINNER"
	AchievementTurnirLomonosovaPrizeWinner AchievementType = "TURNIR_LOMONOSOVA_PRIZE_WINNER"
	// № 83
	AchievementBelchonokWinner      AchievementType = "BELCHONOK_WINNER"
	AchievementBelchonokPrizeWinner AchievementType = "BELCHONOK_PRIZE_WINNER"
)

type AchievementInfo struct {
	Score        int    `json:"score"`
	OlympiadName string `json:"olympiad_name"`
}

var AchievementRegistry = map[AchievementType]AchievementInfo{
	// Базовые
	AchievementMaxwellWinner:         {Score: 20, OlympiadName: "Всероссийская олимпиада по физике имени Дж. К. Максвелла"},
	AchievementMaxwellPrizeWinner:    {Score: 10, OlympiadName: "Всероссийская олимпиада по физике имени Дж. К. Максвелла"},
	AchievementEulerWinner:           {Score: 20, OlympiadName: "Олимпиада имени Леонарда Эйлера по математике"},
	AchievementEulerPrizeWinner:      {Score: 10, OlympiadName: "Олимпиада имени Леонарда Эйлера по математике"},
	AchievementVsoshMunWinner:        {Score: 20, OlympiadName: "Всероссийская олимпиада школьников (муниципальный этап)"},
	AchievementVsoshMunPrizeWinner:   {Score: 10, OlympiadName: "Всероссийская олимпиада школьников (муниципальный этап)"},
	AchievementVsoshRegWinner:        {Score: 40, OlympiadName: "Всероссийская олимпиада школьников (региональный этап)"},
	AchievementVsoshRegPrizeWinner:   {Score: 20, OlympiadName: "Всероссийская олимпиада школьников (региональный этап)"},
	AchievementMinobrListWinner:      {Score: 40, OlympiadName: "Олимпиада из перечня Минобрнауки России"},
	AchievementMinobrListPrizeWinner: {Score: 20, OlympiadName: "Олимпиада из перечня Минобрнауки России"},
	AchievementMathMunWinner:         {Score: 20, OlympiadName: "Муниципальная олимпиада по математике"},
	AchievementMathMunPrizeWinner:    {Score: 10, OlympiadName: "Муниципальная олимпиада по математике"},
	AchievementMathRegWinner:         {Score: 40, OlympiadName: "Региональная олимпиада по математике"},
	AchievementMathRegPrizeWinner:    {Score: 20, OlympiadName: "Региональная олимпиада по математике"},

	// 52 перечневые олимпиады
	AchievementFinatlonWinner:                  {Score: 40, OlympiadName: "\"Финатлон для старшеклассников\" - Всероссийская олимпиада по финансовой грамотности, устойчивому развитию и защите прав потребителей финансовых услуг"},
	AchievementFinatlonPrizeWinner:             {Score: 20, OlympiadName: "\"Финатлон для старшеклассников\" - Всероссийская олимпиада по финансовой грамотности, устойчивому развитию и защите прав потребителей финансовых услуг"},
	AchievementFormulaEdinstvaWinner:           {Score: 40, OlympiadName: "\"Формула Единства\"/\"Третье тысячелетие\""},
	AchievementFormulaEdinstvaPrizeWinner:      {Score: 20, OlympiadName: "\"Формула Единства\"/\"Третье тысячелетие\""},
	AchievementVernadskyWinner:                 {Score: 40, OlympiadName: "Всероссийская академическая олимпиада школьников имени В.И. Вернадского"},
	AchievementVernadskyPrizeWinner:            {Score: 20, OlympiadName: "Всероссийская академическая олимпиада школьников имени В.И. Вернадского"},
	AchievementNtoWinner:                       {Score: 40, OlympiadName: "Всероссийская междисциплинарная олимпиада школьников 8-11 классов \"Национальная технологическая олимпиада\""},
	AchievementNtoPrizeWinner:                  {Score: 20, OlympiadName: "Всероссийская междисциплинарная олимпиада школьников 8-11 классов \"Национальная технологическая олимпиада\""},
	AchievementInnagrikaWinner:                 {Score: 40, OlympiadName: "Всероссийская олимпиада по агрогенетике для школьников старших классов \"Иннагрика\""},
	AchievementInnagrikaPrizeWinner:            {Score: 20, OlympiadName: "Всероссийская олимпиада по агрогенетике для школьников старших классов \"Иннагрика\""},
	AchievementVsoshAiWinner:                   {Score: 40, OlympiadName: "Всероссийская олимпиада по искусственному интеллекту (с возможностью участия иностранных обучающихся)"},
	AchievementVsoshAiPrizeWinner:              {Score: 20, OlympiadName: "Всероссийская олимпиада по искусственному интеллекту (с возможностью участия иностранных обучающихся)"},
	AchievementVysshayaProbaWinner:             {Score: 40, OlympiadName: "Всероссийская олимпиада школьников \"Высшая проба\""},
	AchievementVysshayaProbaPrizeWinner:        {Score: 20, OlympiadName: "Всероссийская олимпиада школьников \"Высшая проба\""},
	AchievementMissiyaVypolnimaWinner:          {Score: 40, OlympiadName: "Всероссийская олимпиада школьников \"Миссия выполнима. Твое призвание - финансист!\""},
	AchievementMissiyaVypolnimaPrizeWinner:     {Score: 20, OlympiadName: "Всероссийская олимпиада школьников \"Миссия выполнима. Твое призвание - финансист!\""},
	AchievementSechenovWinner:                  {Score: 40, OlympiadName: "Всероссийская Сеченовская олимпиада школьников"},
	AchievementSechenovPrizeWinner:             {Score: 20, OlympiadName: "Всероссийская Сеченовская олимпиада школьников"},
	AchievementVsesibirskayaWinner:             {Score: 40, OlympiadName: "Всесибирская открытая олимпиада школьников"},
	AchievementVsesibirskayaPrizeWinner:        {Score: 20, OlympiadName: "Всесибирская открытая олимпиада школьников"},
	AchievementVuzAkademInformatikaWinner:      {Score: 40, OlympiadName: "Вузовско-академическая олимпиада по информатике"},
	AchievementVuzAkademInformatikaPrizeWinner: {Score: 20, OlympiadName: "Вузовско-академическая олимпиада по информатике"},
	AchievementGorodskayaFizikaWinner:          {Score: 40, OlympiadName: "Городская открытая олимпиада школьников по физике"},
	AchievementGorodskayaFizikaPrizeWinner:     {Score: 20, OlympiadName: "Городская открытая олимпиада школьников по физике"},
	AchievementInzhenernayaWinner:              {Score: 40, OlympiadName: "Инженерная олимпиада школьников"},
	AchievementInzhenernayaPrizeWinner:         {Score: 20, OlympiadName: "Инженерная олимпиада школьников"},
	AchievementInternetFizikaWinner:            {Score: 40, OlympiadName: "Интернет-олимпиада школьников по физике"},
	AchievementInternetFizikaPrizeWinner:       {Score: 20, OlympiadName: "Интернет-олимпиада школьников по физике"},
	AchievementInnopolisOpenWinner:             {Score: 40, OlympiadName: "Международная олимпиада \"Innopolis Open\""},
	AchievementInnopolisOpenPrizeWinner:        {Score: 20, OlympiadName: "Международная олимпиада \"Innopolis Open\""},
	AchievementFinSafetyWinner:                 {Score: 40, OlympiadName: "Международная олимпиада по финансовой безопасности"},
	AchievementFinSafetyPrizeWinner:            {Score: 20, OlympiadName: "Международная олимпиада по финансовой безопасности"},
	AchievementIzumrudWinner:                   {Score: 40, OlympiadName: "Международная олимпиада школьников Уральского федерального университета \"Изумруд\""},
	AchievementIzumrudPrizeWinner:              {Score: 20, OlympiadName: "Международная олимпиада школьников Уральского федерального университета \"Изумруд\""},
	AchievementBibnWinner:                      {Score: 40, OlympiadName: "Межрегиональная олимпиада школьников \"Будущие исследователи - будущее науки\""},
	AchievementBibnPrizeWinner:                 {Score: 20, OlympiadName: "Межрегиональная олимпиада школьников \"Будущие исследователи - будущее науки\""},
	AchievementVerchenkoWinner:                 {Score: 40, OlympiadName: "Межрегиональная олимпиада школьников имени И.Я. Верченко"},
	AchievementVerchenkoPrizeWinner:            {Score: 20, OlympiadName: "Межрегиональная олимпиада школьников имени И.Я. Верченко"},
	AchievementVedomstvennyeWinner:             {Score: 40, OlympiadName: "Межрегиональная олимпиада школьников на базе ведомственных образовательных организаций"},
	AchievementVedomstvennyePrizeWinner:        {Score: 20, OlympiadName: "Межрегиональная олимпиада школьников на базе ведомственных образовательных организаций"},
	AchievementSarkisovWinner:                  {Score: 40, OlympiadName: "Межрегиональная химическая олимпиада школьников имени академика П.Д. Саркисова"},
	AchievementSarkisovPrizeWinner:             {Score: 20, OlympiadName: "Межрегиональная химическая олимпиада школьников имени академика П.Д. Саркисова"},
	AchievementKfuPredmetnyeWinner:             {Score: 40, OlympiadName: "Межрегиональные предметные олимпиады Федерального государственного автономного образовательного учреждения высшего образования \"Казанский (Приволжский) федеральный университет\""},
	AchievementKfuPredmetnyePrizeWinner:        {Score: 20, OlympiadName: "Межрегиональные предметные олимпиады Федерального государственного автономного образовательного учреждения высшего образования \"Казанский (Приволжский) федеральный университет\""},
	AchievementYunyeTalantyWinner:              {Score: 40, OlympiadName: "Многопредметная олимпиада \"Юные таланты\""},
	AchievementYunyeTalantyPrizeWinner:         {Score: 20, OlympiadName: "Многопредметная олимпиада \"Юные таланты\""},
	AchievementMoshWinner:                      {Score: 40, OlympiadName: "Московская олимпиада школьников"},
	AchievementMoshPrizeWinner:                 {Score: 20, OlympiadName: "Московская олимпиада школьников"},
	AchievementOmmoWinner:                      {Score: 40, OlympiadName: "Объединенная межвузовская олимпиада школьников"},
	AchievementOmmoPrizeWinner:                 {Score: 20, OlympiadName: "Объединенная межвузовская олимпиада школьников"},
	AchievementKurchatovWinner:                 {Score: 40, OlympiadName: "Олимпиада Курчатов"},
	AchievementKurchatovPrizeWinner:            {Score: 20, OlympiadName: "Олимпиада Курчатов"},
	AchievementPotomkiMendeleevaWinner:         {Score: 40, OlympiadName: "Олимпиада по химии и химической технологии \"Потомки Менделеева\""},
	AchievementPotomkiMendeleevaPrizeWinner:    {Score: 20, OlympiadName: "Олимпиада по химии и химической технологии \"Потомки Менделеева\""},
	AchievementSibiriadaWinner:                 {Score: 40, OlympiadName: "Олимпиада по экономике в рамках международного экономического фестиваля школьников \"Сибириада. Шаг в мечту\""},
	AchievementSibiriadaPrizeWinner:            {Score: 20, OlympiadName: "Олимпиада по экономике в рамках международного экономического фестиваля школьников \"Сибириада. Шаг в мечту\""},
	AchievementGranitNaukiWinner:               {Score: 40, OlympiadName: "Олимпиада школьников \"Гранит науки\""},
	AchievementGranitNaukiPrizeWinner:          {Score: 20, OlympiadName: "Олимпиада школьников \"Гранит науки\""},
	AchievementLomonosovWinner:                 {Score: 40, OlympiadName: "Олимпиада школьников \"Ломоносов\""},
	AchievementLomonosovPrizeWinner:            {Score: 20, OlympiadName: "Олимпиада школьников \"Ломоносов\""},
	AchievementNadezhdaEnergetikiWinner:        {Score: 40, OlympiadName: "Олимпиада школьников \"Надежда энергетики\""},
	AchievementNadezhdaEnergetikiPrizeWinner:   {Score: 20, OlympiadName: "Олимпиада школьников \"Надежда энергетики\""},
	AchievementPokoriVorobyovyWinner:           {Score: 40, OlympiadName: "Олимпиада школьников \"Покори Воробьевы горы!\""},
	AchievementPokoriVorobyovyPrizeWinner:      {Score: 20, OlympiadName: "Олимпиада школьников \"Покори Воробьевы горы!\""},
	AchievementRobofestWinner:                  {Score: 40, OlympiadName: "Олимпиада школьников \"Робофест\""},
	AchievementRobofestPrizeWinner:             {Score: 20, OlympiadName: "Олимпиада школьников \"Робофест\""},
	AchievementFiztekhWinner:                   {Score: 40, OlympiadName: "Олимпиада школьников \"Физтех\""},
	AchievementFiztekhPrizeWinner:              {Score: 20, OlympiadName: "Олимпиада школьников \"Физтех\""},
	AchievementShagVBuduscheeWinner:            {Score: 40, OlympiadName: "Олимпиада школьников \"Шаг в будущее\""},
	AchievementShagVBuduscheePrizeWinner:       {Score: 20, OlympiadName: "Олимпиада школьников \"Шаг в будущее\""},
	AchievementOshipWinner:                     {Score: 40, OlympiadName: "Олимпиада школьников по информатике и программированию"},
	AchievementOshipPrizeWinner:                {Score: 20, OlympiadName: "Олимпиада школьников по информатике и программированию"},
	AchievementTehnokubokWinner:                {Score: 40, OlympiadName: "Олимпиада школьников по программированию \"ТехноКубок\""},
	AchievementTehnokubokPrizeWinner:           {Score: 20, OlympiadName: "Олимпиада школьников по программированию \"ТехноКубок\""},
	AchievementRanhigsWinner:                   {Score: 40, OlympiadName: "Олимпиада школьников Российской академии народного хозяйства и государственной службы при Президенте Российской Федерации"},
	AchievementRanhigsPrizeWinner:              {Score: 20, OlympiadName: "Олимпиада школьников Российской академии народного хозяйства и государственной службы при Президенте Российской Федерации"},
	AchievementSpbguWinner:                     {Score: 40, OlympiadName: "Олимпиада школьников Санкт-Петербургского государственного университета"},
	AchievementSpbguPrizeWinner:                {Score: 20, OlympiadName: "Олимпиада школьников Санкт-Петербургского государственного университета"},
	AchievementYumshWinner:                     {Score: 40, OlympiadName: "Олимпиада Юношеской математической школы"},
	AchievementYumshPrizeWinner:                {Score: 20, OlympiadName: "Олимпиада Юношеской математической школы"},
	AchievementBuduscheeSibiriWinner:           {Score: 40, OlympiadName: "Открытая межвузовская олимпиада школьников Сибирского федерального округа \"Будущее Сибири\""},
	AchievementBuduscheeSibiriPrizeWinner:      {Score: 20, OlympiadName: "Открытая межвузовская олимпиада школьников Сибирского федерального округа \"Будущее Сибири\""},
	AchievementOtkrytayaItmoWinner:             {Score: 40, OlympiadName: "Открытая олимпиада школьников"},
	AchievementOtkrytayaItmoPrizeWinner:        {Score: 20, OlympiadName: "Открытая олимпиада школьников"},
	AchievementOtkrytayaProgWinner:             {Score: 40, OlympiadName: "Открытая олимпиада школьников по программированию"},
	AchievementOtkrytayaProgPrizeWinner:        {Score: 20, OlympiadName: "Открытая олимпиада школьников по программированию"},
	AchievementKognitivnyeTehWinner:            {Score: 40, OlympiadName: "Открытая олимпиада школьников по программированию \"Когнитивные технологии\""},
	AchievementKognitivnyeTehPrizeWinner:       {Score: 20, OlympiadName: "Открытая олимпиада школьников по программированию \"Когнитивные технологии\""},
	AchievementOrmoWinner:                      {Score: 40, OlympiadName: "Открытая региональная межвузовская олимпиада школьников (ОРМО) с международным участием"},
	AchievementOrmoPrizeWinner:                 {Score: 20, OlympiadName: "Открытая региональная межвузовская олимпиада школьников (ОРМО) с международным участием"},
	AchievementOtkrytayaHimichWinner:           {Score: 40, OlympiadName: "Открытая химическая олимпиада"},
	AchievementOtkrytayaHimichPrizeWinner:      {Score: 20, OlympiadName: "Открытая химическая олимпиада"},
	AchievementGazpromWinner:                   {Score: 40, OlympiadName: "Отраслевая олимпиада школьников \"Газпром\""},
	AchievementGazpromPrizeWinner:              {Score: 20, OlympiadName: "Отраслевая олимпиада школьников \"Газпром\""},
	AchievementRosatomWinner:                   {Score: 40, OlympiadName: "Отраслевая физико-математическая олимпиада школьников \"Росатом\""},
	AchievementRosatomPrizeWinner:              {Score: 20, OlympiadName: "Отраслевая физико-математическая олимпиада школьников \"Росатом\""},
	AchievementPirogovWinner:                   {Score: 40, OlympiadName: "Пироговская олимпиада для школьников по химии и биологии"},
	AchievementPirogovPrizeWinner:              {Score: 20, OlympiadName: "Пироговская олимпиада для школьников по химии и биологии"},
	AchievementSpbAstronWinner:                 {Score: 40, OlympiadName: "Санкт-Петербургская астрономическая олимпиада"},
	AchievementSpbAstronPrizeWinner:            {Score: 20, OlympiadName: "Санкт-Петербургская астрономическая олимпиада"},
	AchievementSpbOlimpiadaWinner:              {Score: 40, OlympiadName: "Санкт-Петербургская олимпиада школьников"},
	AchievementSpbOlimpiadaPrizeWinner:         {Score: 20, OlympiadName: "Санкт-Петербургская олимпиада школьников"},
	AchievementTvoyPutVNaukuWinner:             {Score: 40, OlympiadName: "Твой путь в настоящую науку"},
	AchievementTvoyPutVNaukuPrizeWinner:        {Score: 20, OlympiadName: "Твой путь в настоящую науку"},
	AchievementTurnirGorodovWinner:             {Score: 40, OlympiadName: "Турнир городов"},
	AchievementTurnirGorodovPrizeWinner:        {Score: 20, OlympiadName: "Турнир городов"},
	AchievementTurnirLomonosovaWinner:          {Score: 40, OlympiadName: "Турнир имени М.В. Ломоносова"},
	AchievementTurnirLomonosovaPrizeWinner:     {Score: 20, OlympiadName: "Турнир имени М.В. Ломоносова"},
	AchievementBelchonokWinner:                 {Score: 40, OlympiadName: "Университетская олимпиада школьников \"Бельчонок\""},
	AchievementBelchonokPrizeWinner:            {Score: 20, OlympiadName: "Университетская олимпиада школьников \"Бельчонок\""},
}

func GetInfo(ach AchievementType) (AchievementInfo, bool) {
	info, exists := AchievementRegistry[ach]
	return info, exists
}

func GetScore(ach AchievementType) (int, bool) {
	if info, exists := AchievementRegistry[ach]; exists {
		return info.Score, true
	}
	return 0, false
}
