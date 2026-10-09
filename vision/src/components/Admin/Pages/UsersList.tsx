import React, { useEffect, useState, useMemo } from 'react'
import {
    Container,
    Card,
    Table,
    Badge,
    Spinner,
    Alert,
    Form,
    InputGroup
} from 'react-bootstrap'
import {
    Search,
    CheckCircleFill,
    XCircleFill,
    PersonFill,
    TelephoneFill,
    EnvelopeFill
} from 'react-bootstrap-icons'
import { UserParticipantResponseDTO } from '../../types/user'
import { getParticipants } from '../../../requests/SSORequests'
import { useAuth } from '../../Helpers/AuthContext'

const UsersListPage: React.FC = () => {
    const [users, setUsers] = useState<UserParticipantResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const { accessToken } = useAuth()

    useEffect(() => {
        if (!accessToken) return

        setLoading(true)
        getParticipants(accessToken)
            .then((res: any) => {
                const list = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data)
                        ? res.data
                        : Array.isArray(res?.data?.data)
                            ? res.data.data
                            : []
                setUsers(list)
            })
            .catch(err => {
                console.error(err)
                setError('Ошибка загрузки пользователей')
            })
            .finally(() => setLoading(false))
    }, [accessToken])

    // Поиск по ФИО, email или телефону
    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return users

        return users.filter(user => {
            const fullName = `${user.surname} ${user.firstname} ${user.patronymic}`.toLowerCase()
            const email = (user.email || '').toLowerCase()
            const phone = (user.phone_number || '').toLowerCase()
            const parentFio = (user.parent_fio || '').toLowerCase()

            return fullName.includes(q) || email.includes(q) || phone.includes(q) || parentFio.includes(q)
        })
    }, [users, searchQuery])

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        try {
            return new Date(dateStr).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        } catch {
            return dateStr
        }
    }

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" role="status" />
                <p className="mt-2 text-muted">Загрузка списка участников...</p>
            </Container>
        )
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger" className="text-center">{error}</Alert>
            </Container>
        )
    }

    return (
        <Container fluid className="px-4 py-4">
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom py-3">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div>
                            <h3 className="h4 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                                <PersonFill className="text-primary" />
                                Список участников
                            </h3>
                            <small className="text-muted">
                                Всего записей: <strong>{filteredUsers.length}</strong>
                            </small>
                        </div>

                        {/* Поле поиска */}
                        <div style={{ maxWidth: '360px', width: '100%' }}>
                            <InputGroup size="sm">
                                <InputGroup.Text className="bg-light border-end-0">
                                    <Search className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Поиск по ФИО, email, телефону..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="border-start-0 bg-light"
                                />
                            </InputGroup>
                        </div>
                    </div>
                </Card.Header>

                <Card.Body className="p-0">
                    <div className="table-responsive" style={{ maxHeight: '70vh' }}>
                        <Table hover align="center" className="mb-0 text-nowrap" style={{ fontSize: '0.875rem' }}>
                            <thead className="table-light sticky-top shadow-sm">
                            <tr>
                                <th className="ps-3 py-3">Участник</th>
                                <th className="py-3">Контакты</th>
                                <th className="py-3 text-center">Класс</th>
                                <th className="py-3 text-center">Пол</th>
                                <th className="py-3">Дата рождения</th>
                                <th className="py-3 text-center">Статус</th>
                                <th className="py-3">Гражданство</th>
                                <th className="py-3 text-center">ОВЗ</th>
                                <th className="py-3">Родитель / Представитель</th>
                                <th className="py-3">Телефон родителя</th>
                                <th className="pe-3 py-3 text-muted">ID участника</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="text-center py-5 text-muted">
                                        Участники не найдены
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        {/* ФИО */}
                                        <td className="ps-3 fw-semibold text-dark">
                                            {user.surname} {user.firstname} {user.patronymic}
                                        </td>

                                        {/* Контакты участника */}
                                        <td>
                                            <div className="d-flex flex-column gap-1">
                                                    <span className="d-flex align-items-center gap-1 text-muted small">
                                                        <EnvelopeFill size={12} className="text-primary opacity-75" />
                                                        {user.email || '—'}
                                                    </span>
                                                <span className="d-flex align-items-center gap-1 text-muted small font-monospace">
                                                        <TelephoneFill size={12} className="text-success opacity-75" />
                                                    {user.phone_number || '—'}
                                                    </span>
                                            </div>
                                        </td>

                                        {/* Класс */}
                                        <td className="text-center">
                                            <Badge bg="light" text="dark" className="border px-2 py-1">
                                                {user.class_number ? `${user.class_number} кл.` : '—'}
                                            </Badge>
                                        </td>

                                        {/* Пол */}
                                        <td className="text-center">
                                            {user.gender === 1 ? 'М' : user.gender === 2 ? 'Ж' : '—'}
                                        </td>

                                        {/* Дата рождения */}
                                        <td className="text-muted font-monospace small">
                                            {formatDate(user.birthdate)}
                                        </td>

                                        {/* Активирован */}
                                        <td className="text-center">
                                            {user.activated ? (
                                                <Badge bg="success-subtle" className="text-success border border-success-subtle d-inline-flex align-items-center gap-1">
                                                    <CheckCircleFill size={10} /> Активен
                                                </Badge>
                                            ) : (
                                                <Badge bg="danger-subtle" className="text-danger border border-danger-subtle d-inline-flex align-items-center gap-1">
                                                    <XCircleFill size={10} /> Нет
                                                </Badge>
                                            )}
                                        </td>

                                        {/* Гражданство */}
                                        <td>
                                            {Number(user.citizenship) === 1 ? 'РФ' : Number(user.citizenship) === 2 ? 'Другое' : '—'}
                                        </td>

                                        {/* ОВЗ */}
                                        <td className="text-center">
                                            {Number(user.disability) === 2 ? (
                                                <Badge bg="warning-subtle" className="text-warning-emphasis border border-warning-subtle">
                                                    Есть
                                                </Badge>
                                            ) : (
                                                <span className="text-muted">Нет</span>
                                            )}
                                        </td>

                                        {/* Данные родителя */}
                                        <td>
                                            {user.parent_fio ? (
                                                <span className="fw-medium text-dark">{user.parent_fio}</span>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
                                        </td>

                                        {/* Телефон родителя */}
                                        <td className="font-monospace small text-muted">
                                            {user.parent_number || '—'}
                                        </td>

                                        {/* ID */}
                                        <td className="pe-3">
                                            <code className="text-muted small" title={user.id}>
                                                {user.id.slice(0, 8)}…
                                            </code>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default UsersListPage