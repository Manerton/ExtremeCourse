export const Citizenship = {
    Russia: 1,
    Another: 2
}

export const GetCitizenshipLabel = (num: number) => {
    switch(num) {
        case Citizenship.Russia: 
            return "Российская федерация"
        default:
            return "Другое"
    }
} 