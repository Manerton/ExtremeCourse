export const API_CONFIG = {
    EVENT: "http://172.16.0.196:6611/events/",
    CHILD: "http://172.16.0.196:6611/events/child",
    REGIONAL: "http://172.16.0.196:6611/regional-stages",
    AUTH: "http://172.16.1.39:8181/api/users",
    JUREASSIGNMENTS: "http://172.16.1.39:8090/jury-assignments",
    APPLICATION: "http://172.16.1.39:8082/applications",
};

// const API_CONFIG = {
//     EVENTS: "http://localhost:8080/api/events",
//     REGIONAL: "http:/localhost:8080/api/events/regional-stage",
//     AUTH: "http://localhost:8181/api/users",
//     JUREASSIGNMENTS: "http://localhost:8090/jury-assignments",
//     APPLICATION: "http://localhost:8082/applications",
// };

// export const AUTH = {
//     login: "http://localhost:6611/auth",
//     logout: "http://localhost:6611/logout",
//     refresh: "http://localhost:6611/refresh",
//     register: "http://localhost:6611/register"
// }



export const AUTH = {
    login: "http://172.16.0.196:6611/auth",
    logout: "http://172.16.0.196:6611/logout",
    refresh: "http://172.16.0.196:6611/refresh",
    register: "http://172.16.0.196:6611/register"
}

export const SCHOOLS = {
    all: "http://172.16.0.196:6611/schools",
    byId: "http://172.16.0.196:6611/schools/"
}

export const USER = {
    info: "http://172.16.0.196:6611/users/all-info/",

}

export const APPLICATION = {
    getByUser: "http://172.16.0.196:6611/ApplicationEvent/"
}

export const RESULT = {
    allEventsByUserId: "http://172.16.0.196:6611/history-event/",
    allByEventIdUserId: "http://172.16.0.196:6611/result/result-by-event-user/",
    allEventsWithAppealByUserId: "http://172.16.0.196:6611/events-appeal/"
}

export const APPEAL = {
    create: "http://172.16.0.196:6611/appeal/store",
    getAppealsByEventUser: "http://172.16.0.196:6611/appeal/appeal-event-user/",
    get: ""
}

export const PARTICIPANT = {
    info: "http://172.16.0.196:6611/users/participant/all-info/",
}


const LOCAL_CONFIG = {
    EVENTS: "http://localhost:8080/events",
    JUREASSIGNMENTS: "http://localhost:8090/jury-assignments",
    APPLICATION: "http://localhost:8082/applications",
}

export const HOSTS = {
    OLYMP_ADMIN: "http://admin.olymp.local",
    OLYMP_NOTIFICATION: "http://notification.olymp.local"
}

export default { API_CONFIG, HOSTS };