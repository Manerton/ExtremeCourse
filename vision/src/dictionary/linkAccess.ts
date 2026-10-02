export const TypeLinkAccess = {
  District: 0,
  School: 1

} as const;


export const GetTypeLinkAccess = (num: number) => {
    switch(num) {
        case TypeLinkAccess.District: 
            return "Муниципалитет"
        case TypeLinkAccess.School: 
            return "Школа"
        default:
            return "Что-то"
    }
} 