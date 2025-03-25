import { useState, useEffect } from 'react';

// Next tape caractère spéciaux et storage de la base de données
function UserTable({ users, sortOrder, onSortAge, totalUsers }) {
    return (

        <div className="container">
            <p>Users Number : {totalUsers}</p>
            <>
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

            </>
        </div>

    );
}

function App() {

    const [page, setPage] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return parseInt(localStorage.getItem('page')) || parseInt(params.get('page')) || 1;
    });
    useEffect(() => {
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);
    }, [page]);

    const [users, setUsers] = useState(() => {
        // Récupère depuis localStorage au chargement
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : [];
    });

    // Sauvegarde quand les données changent
    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('page', page);
    }, [users, page]);

    const [sortOrder, setSortOrder] = useState('none'); // État du tri
    const [genderFilter, setGenderFilter] = useState('all')
    const [searchInput, setSearchInput] = useState('');
    const itemsPerPage = 10; // Nombre d'items par page


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
        .filter(user =>
            `${user.name.first} ${user.name.last}`
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/ø/g, "o")
                .replace(/å/g, "a")
                .replace(/ß/g, "ss")
                .replace(/æ/g, "ae")
                .replace(/œ/g, "oe")
                .replace(/Ø/g, "o")
                .toLowerCase()
                .includes(searchInput.toLowerCase())
        )//filtrer par nom
        .toSorted((a, b) => {
            if (sortOrder === 'none') return 0;
            return (a.dob.age - b.dob.age) * (sortOrder === 'desc' ? -1 : 1)
        })//Par age
        .filter(user => {
            if (genderFilter === 'all') return true
            return user.gender === genderFilter
        })

    // Pagination manuelle
    const paginatedUsers = filteredUsers.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // Gère les changements de page
    const nextPage = () => {
        if (page * itemsPerPage < filteredUsers.length) {
            setPage(p => p + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            setPage(p => p - 1);
        }
    };

    return (
        <div>
            <h1>React User Table</h1>
            <button onClick={fetchUsers}>Fetch</button>
            <button onClick={fetchMoreUsers}>Add 10 users</button>
            <div>
                <input
                    type="text"
                    placeholder="Filter By name"
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        setPage(1); // Reset à la page 1 quand on filtre
                    }}
                />


                <select onChange={(e) => setGenderFilter(e.target.value)} value={genderFilter} >
                    <option value="all">All</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                </select>
            </div>

            <UserTable
                users={paginatedUsers}
                totalUsers={filteredUsers.length}
                sortOrder={sortOrder}
                onSortAge={() => {
                    handleSortAge();
                    setPage(1); // Reset à la page 1 quand on trie
                }}
            />
            <div className="pagination-controls">
                <button onClick={prevPage} disabled={page === 1}>
                    Précédent
                </button>

                <span>
                    Page {page} / {Math.ceil(filteredUsers.length / itemsPerPage)}
                </span>

                <button
                    onClick={nextPage}
                    disabled={page * itemsPerPage >= filteredUsers.length}
                >
                    Suivant
                </button>
            </div>
        </div>

    );
}

export default App;