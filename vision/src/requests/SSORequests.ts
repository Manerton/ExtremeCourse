import axios from "axios";
import { AUTH, LINKS, PARTICIPANT, SCHOOLS, USER } from "../config/api";
import type { ChangePasswordForm, ForgotPasswordForm, RegisterForm, User, UserParticipant } from "../components/types/user";
import type { School } from "../components/types/schools";

export async function axiosSSORegister(data: RegisterForm) {
    const res = await axios.post(AUTH.register, data, { withCredentials: true });
    return res.status;
}

export async function axiosSSOLogin(email: string, password: string) {
    const res = await axios.post(AUTH.login, { email, password }, { withCredentials: true });
    return res.data.data
}

export async function axiosSSOLogout(token: string) {
    const res = await axios.post(
        AUTH.logout,
        {}, // тело запроса
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
    return res.status
}

export async function axiosSSORefresh() {
    const res = await axios.post(AUTH.refresh, {}, { withCredentials: true });
    return res.data.data
}

export async function axiosSSOUserInfo(token: string, userId: string) {
    const res = await axios.get(
        USER.info + `${userId}`,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
    return res.data.data as User;
}

export async function axiosSSOUserParticipantInfo(token: string, userId: string) {
    const res = await axios.get(
        PARTICIPANT.info + `${userId}`,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
    const data = res.data.data;

    return {
        User: {
            id: data.user_id,
            email: data.email,
            firstname: data.firstname,
            surname: data.surname,
            patronymic: data.patronymic,
            phone_number: data.phone_number,
            birthdate: data.birthdate,
            gender: data.gender,
            role: data.role,
        },
        school: data.school_id,
        participant_id: data.participant_id,
        disability: data.disability,
        classnumber: data.class_number,
        citezenship: data.citizenship,
    };
}

export async function axiosSSOAllSchools(): Promise<School[]> {
    const res = await axios.get(SCHOOLS.all);
    return res.data.data as School[]; // data → []SchoolResponseDTO
}

export async function axiosSSOUpdateUser(token: string, id: string, payload: any) {
    await axios.put(USER.update + `${id}`, payload,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
}

export const axiosSSOUpdateParticipant = async (token: string, participantId: string, data: any) => {
    return await axios.put(
        `${PARTICIPANT.update}${participantId}`,
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json', 
            },
        }
    );
};

export async function axiosSSOSchoolById(token: string,schoolId: string): Promise<School> {
    const res = await axios.get(SCHOOLS.byId + `${schoolId}`, 
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
    return res.data.data as School; // data → SchoolResponseDTO
}

export async function axiosSSOChangePassword(token: string, data: ChangePasswordForm) { 
    const res = await axios.post(
        USER.changePassword + data.user_id,
        data, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
    return res.status
}

export async function axiosSSOForgotPassword(data: ForgotPasswordForm) { 
    const res = await axios.post(
        AUTH.forgotPassword,
        data
    );
    return res.status
}

export async function axiosSSOVerifySMSCode(phoneNumber: string, code: string) {
    const res = await axios.post(
        AUTH.verifySMS,
        { phone_number: phoneNumber, code: code },
        { withCredentials: true }
    );

    return res.data;// TODO!! УТОЧНИТЬ НУЖНО ЛИ DATA
}

export async function axiosSSOVerifyEmail(Email: string,config = {}) {
    const res = await axios.post(
        AUTH.verifyEmail,
        { credential: Email},
        config
        //{ withCredentials: true }
    );

    return res.data;
}

export async function axiosSSOGetAccessLinks(token: string, region: number) {
    const res = await axios.get(
        LINKS.getLinks + region, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    )

    return res.data.data
}

export async function axiosSSOVerifyPhoneNumber(phoneNumber: string,config = {}) {
    const res = await axios.post(
        AUTH.verifyPhone,
        { credential: phoneNumber},
        config
        //{ withCredentials: true }
    );

    return res.data;
}

export async function axiosSSODistrict(districtNumber: string) {
    const res = await axios.get(AUTH.district + districtNumber);
    return res.data;
}

export async function axiosSSOSchool(selectedDistrictId: string) {
    const res = await axios.get(AUTH.school + selectedDistrictId);
    return res.data;
}

export async function getParticipants(token: string) {
  const res = await axios.get(
    USER.infoParticipant,
    {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${token}` // добавляем токен
        }
    }
  )
  return res.data
}