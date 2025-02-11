function FilterControls({ onFilter, onGenderFilter, onSortAge }) {
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
            <button onClick={onSortAge}>Sort by Age</button>
        </div>
    );
}

export default FilterControls;