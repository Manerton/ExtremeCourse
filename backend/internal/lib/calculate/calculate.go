package calculate

import "main/internal/dictionary/achievement_dictionary"

func CalculateScore(codes []string) int {
	total := 0
	for _, code := range codes {
		if score, ok := achievement_dictionary.GetScore(achievement_dictionary.AchievementType(code)); ok {
			total += score
		}
	}
	return total
}
