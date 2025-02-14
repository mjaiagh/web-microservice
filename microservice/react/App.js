import React, { useState, useEffect } from 'react';
import 'milligram';
import './App.css';
import axios from 'axios';

const API_BASE = 'http://178.33.123.72:8001';

export default function App() {
    const [movies, setMovies] = useState([]);
    const [actors, setActors] = useState([]);
    const [movieTitle, setMovieTitle] = useState('');
    const [movieYear, setMovieYear] = useState('');
    const [actorName, setActorName] = useState('');
    const [actorSurname, setActorSurname] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchMovies();
        fetchActors();
    }, []);

    const fetchMovies = async () => {
        try {
            const res = await axios.get(`${API_BASE}/movies`);
            setMovies(res.data);
        } catch (err) {
            setErrorMessage('Fetching movies failed');
        }
    };

    const fetchActors = async () => {
        try {
            const res = await axios.get(`${API_BASE}/actors`);
            setActors(res.data);
        } catch (err) {
            setErrorMessage('Failed to fetch actors.');
        }
    };

    const addMovie = async () => {
        try {
            await axios.post(`${API_BASE}/movies`, { title: movieTitle, year: parseInt(movieYear) });
            fetchMovies();
        } catch {
            setErrorMessage('Failed to add movie.');
        }
    };

    const addActor = async () => {
        try {
            await axios.post(`${API_BASE}/actors`, { name: actorName, surname: actorSurname });
            fetchActors();
        } catch {
            setErrorMessage('Failed to add actor.');
        }
    };

    const deleteMovie = async (id) => {
        if (!id) {
            console.error('Movie ID is undefined');
            return;
        }
        try {
            await axios.delete(`${API_BASE}/movies/${id}`);
            setMovies(movies.filter(movie => movie.id !== id));
        } catch {
            setErrorMessage('Failed to delete movie.');
        }
    };

    const deleteActor = async (id) => {
        try {
            await axios.delete(`${API_BASE}/actors/${id}`);
            fetchActors();
        } catch {
            setErrorMessage('Failed to delete actor.');
        }
    };

    const showDetails = async (type, id) => {
        try {
            const response = await axios.get(`${API_BASE}/${type}/${id}`);
            setSelectedItem(response.data);
            setModalVisible(true);
        } catch {
            setErrorMessage('Failed to fetch details.');
        }
    };

    return (
        <div className="container">
            <h1>Movies & Actors Manager</h1>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

            <section>
                <h2>Add Movie</h2>
                <input placeholder="Title" value={movieTitle} onChange={(e) => setMovieTitle(e.target.value)} />
                <input placeholder="Year" type="number" value={movieYear} onChange={(e) => setMovieYear(e.target.value)} />
                <button onClick={addMovie}>Add Movie</button>
            </section>

            <section>
                <h2>Add Actor</h2>
                <input placeholder="Name" value={actorName} onChange={(e) => setActorName(e.target.value)} />
                <input placeholder="Surname" value={actorSurname} onChange={(e) => setActorSurname(e.target.value)} />
                <button onClick={addActor}>Add Actor</button>
            </section>

            <section>
                <h2>Movies</h2>
                <ul>
                    {movies.map(movie => (
                        <li key={movie.id} style={{ display: 'flex', gap: '10px' }}>
                            {movie.title} ({movie.year})
                            <button onClick={() => showDetails('movies', movie.id)}>Details</button>
                            <button onClick={() => deleteMovie(movie.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Actors</h2>
                <ul>
                    {actors.map(actor => (
                        <li key={actor.id} style={{ display: 'flex', gap: '10px' }}>
                            {actor.name} {actor.surname}
                            <button onClick={() => showDetails('actors', actor.id)}>Details</button>
                            <button onClick={() => deleteActor(actor.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </section>

            {modalVisible && (
                <div className="modal" style={{ border: '1px solid', padding: '20px', background: '#fff' }}>
                    <h2>Details</h2>
                    <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
                    <button onClick={() => setModalVisible(false)}>Close</button>
                </div>
            )}
        </div>
    );
}