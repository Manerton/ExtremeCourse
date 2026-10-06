package achievement_dictionary

type AchievementType string

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

// AchievementScores сопоставляет код достижения с количеством баллов
var AchievementScores = map[AchievementType]int{
	AchievementMaxwellWinner:         20,
	AchievementMaxwellPrizeWinner:    10,
	AchievementEulerWinner:           20,
	AchievementEulerPrizeWinner:      10,
	AchievementVsoshMunWinner:        20,
	AchievementVsoshMunPrizeWinner:   10,
	AchievementVsoshRegWinner:        40,
	AchievementVsoshRegPrizeWinner:   20,
	AchievementMinobrListWinner:      20,
	AchievementMinobrListPrizeWinner: 10,
	AchievementMathMunWinner:         20,
	AchievementMathMunPrizeWinner:    10,
	AchievementMathRegWinner:         40,
	AchievementMathRegPrizeWinner:    20,
}

// GetScore возвращает баллы за достижение и флаг успешного поиска
func GetScore(ach AchievementType) (int, bool) {
	score, exists := AchievementScores[ach]
	return score, exists
}
