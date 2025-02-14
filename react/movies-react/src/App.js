import React, { useState, useEffect } from 'react';
import 'milligram';
import './App.css';
import axios from 'axios';

const API_BASE = 'http://178.33.123.72:8001';

const buttonGroupStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
};


export default function App() {
    const [movies, setMovies] = useState([]);
    const [actors, setActors] = useState([]);
    const [movieTitle, setMovieTitle] = useState('');
    const [movieYear, setMovieYear] = useState('');
    const [actorName, setActorName] = useState('');
    const [actorSurname, setActorSurname] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [actorsForMovie, setSelectedItemActors] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [type, setType] = useState(null);

    useEffect(() => {
        fetchMovies();
        fetchActors();
    }, []);

    const fetchMovies = async () => {

        const res = await axios.get(`${API_BASE}/movies`);
        setMovies(res.data);

    };

    const fetchActors = async () => {
        const res = await axios.get(`${API_BASE}/actors`);
        setActors(res.data);

    };

    const addMovie = async () => {

        await axios.post(`${API_BASE}/movies`, { title: movieTitle, year: parseInt(movieYear) });
        fetchMovies();

    };


    const addActor = async () => {

        await axios.post(`${API_BASE}/actors`, { name: actorName, surname: actorSurname });
        fetchActors();

    };

    const deleteMovie = async (id) => {
        if (!id) {
            console.error('NO movie ID');
            return;
        }
        await axios.delete(`${API_BASE}/movies/${id}`);
        setMovies(movies.filter(movie => movie.id !== id));

    };

    const deleteActor = async (id) => {

        await axios.delete(`${API_BASE}/actors/${id}`);
        fetchActors();

    };

    const showDetails = async (type, id) => {

        const response = await axios.get(`${API_BASE}/${type}/${id}`);
        setSelectedItem(response.data);
        setType(type)
        if (type === 'movies') {
            const actorsResponse = await axios.get(`${API_BASE}/movies/${id}/actors`);
            setSelectedItemActors(actorsResponse.data);
        }
        setModalVisible(true);

    };



    return (
        <div className="container">
            <h1>Movies database</h1>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

            <section>
                <h2>Add Movie</h2>
                <input placeholder="title" value={movieTitle} onChange={(e) => setMovieTitle(e.target.value)} />
                <input placeholder="year" type="number" value={movieYear} onChange={(e) => setMovieYear(e.target.value)} />
                <button onClick={addMovie}>Add Movie</button>
            </section>

            <section>
                <h2>Add Actor</h2>
                <input placeholder="name" value={actorName} onChange={(e) => setActorName(e.target.value)} />
                <input placeholder="surname" value={actorSurname} onChange={(e) => setActorSurname(e.target.value)} />
                <button onClick={addActor}>Add Actor</button>
            </section>



            <section>
                <h2>Movies</h2>
                <ul>
                    {movies.map(movie => (
                        <li key={movie.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{movie.title} ({movie.year})</span>
                            <div style={buttonGroupStyle}>
                                <button onClick={() => showDetails('movies', movie.id)}>Details</button>
                                <button onClick={() => deleteMovie(movie.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Actors</h2>
                <ul>
                    {actors.map(actor => (
                        <li key={actor.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{actor.name} {actor.surname}</span>
                            <div style={buttonGroupStyle}>
                                <button onClick={() => showDetails('actors', actor.id)}>Details</button>
                                <button onClick={() => deleteActor(actor.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {modalVisible && (
                <div className="modal">
                    <h2>Details</h2>
                    <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
                    <button onClick={() => setModalVisible(false)}>Close</button>
                </div>
            )}

        </div>
    );
}