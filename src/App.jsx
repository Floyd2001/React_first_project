import { useState, useEffect } from 'react';

// Composant permettant l'affichage de la liste d'utilisateurs et des boutons de tri.
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
    //Fonction pour permettre de mettre tous les states dans l url que ce soit la page ou les filtres
    function usePersistedState(key, defaultValue) {
        const [state, setState] = useState(() => {
            //Valeur à récupérer
            const params = new URLSearchParams(window.location.search);
            return params.get(key) || localStorage.getItem(key) || defaultValue;
        });

        // Modification dès changement
        useEffect(() => {
            localStorage.setItem(key, state);
            const url = new URL(window.location);
            url.searchParams.set(key, state);
            window.history.pushState({}, '', url);
        }, [key, state]);
        return [state, setState];
    }

    const [page, setPage] = usePersistedState('page', 1);
    const [genderFilter, setGenderFilter] = usePersistedState('gender', 'all');
    const [sortOrder, setSortOrder] = usePersistedState('sort', 'none');
    const [searchInput, setSearchInput] = usePersistedState('search', ' ');
    const itemsPerPage = 10; // Nombre d'items par page


    // Stockage des données 
    const [users, setUsers] = useState(() => {
        // Récupère depuis localStorage au chargement
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : [];
    });
    // Sauvegarde quand les données changent
    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);



    // Récupération des utilisateurs
    async function fetchUsers() {
        try {
            const response = await fetch('https://randomuser.me/api/?results=20');
            const { results } = await response.json();
            setUsers(results);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs :', error);
        }
    }
    // Ajout d'utilisateurs supplémentaires après un fetch sans écraser les anciens
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


    // Trie par âge
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
        )//filtrer par nom en prenant en compte les caractères spéciaux
        .toSorted((a, b) => {
            if (sortOrder === 'none') return 0;
            return (a.dob.age - b.dob.age) * (sortOrder === 'desc' ? -1 : 1)
        })//Par age
        .filter(user => {
            if (genderFilter === 'all') return true
            return user.gender === genderFilter
        })//Par sexe

    // Sélection du nombre d'utilisateurs sur une page
    const paginatedUsers = filteredUsers.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // Gestion de navigation de page
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


                <select
                    value={genderFilter}
                    onChange={(e) => {
                        setGenderFilter(e.target.value);
                        setPage(1) // Reset à la page 1 quand on filtre
                    }}
                >
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