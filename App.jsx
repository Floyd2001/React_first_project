import { useState } from 'react';

function UserTable({ users, sortOrder, onSortAge }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Photo</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Tel</th>
                    <th>Âge  
                        <button onClick={onSortAge} >
                            {sortOrder === "asc" ? "🔼" : sortOrder === "desc" ? "🔽" : "⚪️"}
                        </button>
                    </th>
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

function FilterControls({ onFilter, onGenderFilter }) {
    return (
        <div>
            <input
                type="text"
                placeholder="Filter By name"
                onChange={(e) => onFilter(e.target.value)}
            />
            
            <select onChange={(e) => onGenderFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
            </select>
        </div>
    );
}

function App() {
    const [users, setUsers] = useState([]); // Données originales
    const [filteredUsers, setFilteredUsers] = useState([]); // Données filtrées
    const [sortOrder, setSortOrder] = useState('none'); // État du tri

    // Récupérer les utilisateurs
    async function fetchUsers() {
        try {
            const response = await fetch('https://randomuser.me/api/?results=20');
            const { results } = await response.json();
            setUsers(results);
            setFilteredUsers(results);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs :', error);
        }
    }

    // Filtrer par nom
    const handleFilter = (input) => {
        const filtered = users.filter(user =>
            (`${user.name.first} ${user.name.last}`).toLowerCase().includes(input.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    // Filtrer par genre
    const handleGenderFilter = (gender) => {
        if (gender === 'all') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user => user.gender === gender);
            setFilteredUsers(filtered);
        }
    };

    // Trier par âge
    const handleSortAge = () => {
        let sortedUsers = [...filteredUsers];
        if (sortOrder === "none" ) {
            sortedUsers.sort((a, b) => a.dob.age - b.dob.age);
            setSortOrder("asc"); 
        } else if (sortOrder === "asc") {
            sortedUsers.sort((a, b) => b.dob.age - a.dob.age);
            setSortOrder("desc"); 
        } else {
            sortedUsers = [...users];
            setSortOrder("none");
        }
        setFilteredUsers(sortedUsers);
    };

    return (
        <div>
            <h1>React User Table</h1>
            <button onClick={fetchUsers}>Fetch</button>
            <FilterControls
                onFilter={handleFilter}
                onGenderFilter={handleGenderFilter}
            />
            <UserTable 
                users={filteredUsers} 
                sortOrder={sortOrder}
                onSortAge={handleSortAge}
            />
        </div>
    );
}

export default App;