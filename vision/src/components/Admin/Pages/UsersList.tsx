import React, { useEffect, useState } from 'react'
import { UserParticipantResponseDTO } from '../../types/user'
import { getParticipants } from '../../../requests/SSORequests'
import { useAuth } from '../../Helpers/AuthContext'

const UsersListPage: React.FC = () => {
    const [users, setUsers] = useState<UserParticipantResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const {accessToken} = useAuth();


    useEffect(() => {
        getParticipants(accessToken!)
            .then(setUsers)
            .catch(err => {
                console.error(err)
                setError('Ошибка загрузки пользователей')
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div>Загрузка...</div>
    if (error) return <div>{error}</div>

    return (
        <div>
            <h2>Участники</h2>

            <table border={1} cellPadding={8}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>ФИО</th>
                        <th>Телефон</th>
                        <th>Дата рождения</th>
                        <th>Пол</th>
                        <th>Активирован</th>
                        <th>Класс</th>
                        <th>Школа</th>
                        <th>Гражданство</th>
                        <th>ОВЗ</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>
                                {user.surname} {user.firstname} {user.patronymic}
                            </td>
                            <td>{user.phone_number}</td>
                            <td>{user.birthdate}</td>
                            <td>{user.gender}</td>
                            <td>{user.activated ? 'Да' : 'Нет'}</td>
                            <td>{user.class_number}</td>
                            <td>{user.school_id}</td>
                            <td>{user.citizenship}</td>
                            <td>{user.disability}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default UsersListPage
