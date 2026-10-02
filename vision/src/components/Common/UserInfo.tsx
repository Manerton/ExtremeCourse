import { FaUserGraduate } from "react-icons/fa";

interface UserInfoBlockProps {
    surname?: string;
    firstname?: string;
    patronymic?: string;
    email?: string;
    actions?: React.ReactNode;
}

const UserInfoBlock: React.FC<UserInfoBlockProps> = ({ surname, firstname, patronymic , email, actions }) => {
    return (
        <div>
            <div className="d-flex align-items-center m-4">
                <FaUserGraduate size={50} className="rounded-circle me-3" />
                <div className='d-flex text-align-center'>
                    <div>
                        <h4 className='p-0'>{surname} {firstname} {patronymic}</h4>
                        <p className="text-muted">{email}</p>
                    </div>
                </div>
                <div className="ms-auto d-flex gap-2">
                    {actions}
                </div>
            </div>
        </div>
    );
}

export default UserInfoBlock;
