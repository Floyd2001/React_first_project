function UserTable({ users }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Photo</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Tel</th>
                    <th>Âge</th>
                    <th>Gender</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user, index) => (
                    <tr key={index}>
                        <td><img src={user.picture.thumbnail} alt={`${user.name.first} Photo`} /></td>
                        <td>{user.name.first} {user.name.last}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.dob.age}</td>
                        <td>{user.gender === 'male' ? '♂️' : user.gender === 'female' ? '♀️' : '⚧️'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default UserTable;