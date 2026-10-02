export interface School {
    id: string
    name: string
    region: number
}

type SchoolResponseDTO = {
    id: string;
    name: string;
    district_id: string;
}

type DistrictDTOResponse = {
    id: string;
    name: string;
    region: number;
}
