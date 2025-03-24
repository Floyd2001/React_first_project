import { useState } from 'react';
function UserTable({ users, sortOrder, onSortAge }) {
    return (
        <div className="container">
            <p>Users Number : {users.length}</p>
            <table className="user-table">

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
                        <tr key={index} >
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
        </div>
    );
}

function App() {
    const [users, setUsers] = useState([]); // Données originales
    const [sortOrder, setSortOrder] = useState('none'); // État du tri
    const [genderFilter, setGenderFilter] = useState('all')

    // Récupérer les utilisateurs
    async function fetchUsers() {
        try {
            const response = await fetch('https://randomuser.me/api/?results=20');
            const { results } = await response.json();
            setUsers(results);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs :', error);
        }
    }
    // Ajouter des utilisateurs
    async function fetchMoreUsers() {
        try {

            const response = await fetch('https://randomuser.me/api/?results=10');
            const { results } = await response.json();
            setUsers(prevUsers => [...prevUsers, ...results]); //Use of ... for add row instead of add table in table et 
            // On conserve les anciens et on ajoute les nouveaux
            // Pas besoin de if vu que une maj d'élémnts avec "=>" sait gérer ça 
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs supplémentaires :', error);
        }
    }

    // Filtrer par nom
    const handleFilter = (input) => {
        const filtered = users.filter(user =>
            (`${user.name.first} ${user.name.last}`).toLowerCase().includes(input.toLowerCase())
        );
    };

    // Trier par âge
    const handleSortAge = () => {
        if (sortOrder === "none") {
            return setSortOrder("asc");
        }

        if (sortOrder === "asc") {
            return setSortOrder("desc");
        }

        setSortOrder("none");
    };


    const filteredUsers = users
        .toSorted((a, b) => {
            if (sortOrder === 'none') return 0;
            return (a.dob.age - b.dob.age) * (sortOrder === 'desc' ? -1 : 1)
        })
        .filter(user => {
            if (genderFilter === 'all') return true
            return user.gender === genderFilter
        })

    return (
        <div>
            <h1>React User Table</h1>
            <button onClick={fetchUsers}>Fetch</button>
            <button onClick={fetchMoreUsers}>Add 10 users</button>
            <div>
                <input
                    type="text"
                    placeholder="Filter By name"
                    onChange={(e) => onFilter(e.target.value)}
                />

                <select onChange={(e) => setGenderFilter(e.target.value)} value={genderFilter} >
                    <option value="all">All</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                </select>
            </div>
            <UserTable
                users={filteredUsers}
                sortOrder={sortOrder}
                onSortAge={handleSortAge}
            />
        </div>
    );
}

export default App;