# type: ignore

from fastapi import FastAPI
from pydantic import BaseModel
from orm import MoviesDB, Actor, Movie
from typing import List
from pydantic import BaseModel, ConfigDict
from typing import Optional
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware


class AssignActorsSchema(BaseModel):
    movie_id: int
    actor_ids: List[int]


class ActorSchema(BaseModel):
    id: Optional[int] = None
    name: str
    surname: str
    model_config = ConfigDict(from_attributes=True)


class MovieSchema(BaseModel):
    id: Optional[int] = None
    year: int
    title: str
    year: int
    model_config = ConfigDict(from_attributes=True)


app: FastAPI = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

movies_db = MoviesDB()


@app.get("/hello")
async def hello() -> str:
    return "ok"


@app.get("/actors")
async def actors() -> List[ActorSchema]:
    actors: Actor = movies_db.get_actors()
    return [ActorSchema.from_orm(actor) for actor in actors]


@app.delete("/actors/{actor_id}")
async def delete_actor(actor_id: int):
    try:
        actor: Actor = Actor.get(actor_id)
        print(f"Got actor {actor}")
        actor.delete_instance()
        movies_db.commit()
        return "Deleted"
    except Exception as e:
        raise HTTPException(status_code=500, detail="Actor cannot be deleted")


@app.post("/actors")
async def add_actor(actor: ActorSchema):
    try:
        new_actor: Actor = Actor.create(name=actor.name, surname=actor.surname)
        movies_db.commit()
        return ActorSchema.from_orm(new_actor)
    except Exception as e:
        return {"Error while adding actor": str(e)}


@app.get("/actors/{actor_id}")
async def get_actor(actor_id: int):
    try:
        actor: Actor = Actor.get(actor_id)
        return ActorSchema.from_orm(actor)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Actor not found")


@app.get("/movies")
async def movies() -> List[MovieSchema]:
    movies: Movie = movies_db.get_movies()
    return [MovieSchema.from_orm(movie) for movie in movies]


@app.get("/movies/{movie_id}")
async def get_movie(movie_id: int):
    try:
        movie = Movie.get(movie_id)
        return MovieSchema.model_validate(movie)
    except Exception:
        raise HTTPException(status_code=404, detail="Movie not found")


@app.post("/movies")
async def create_movie(movie: MovieSchema):
    print(f"{movie}")
    try:
        new_movie = Movie.create(title=movie.title, year=movie.year)
        movies_db.commit()
        return MovieSchema.from_orm(new_movie)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error while adding movie: {str(e)}")


@app.delete("/movies/{movie_id}")
async def delete_movie(movie_id: int):
    try:
        movie = Movie.get(movie_id)
        movie.delete_instance()
        movies_db.commit()
        return "Deleted"
    except Exception:
        raise HTTPException(status_code=500, detail="Actor cannot be deleted")


@app.post("/movies/actors")
async def assign_actors_to_movie(payload: AssignActorsSchema):
    try:
        movie = Movie.get(payload.movie_id)

        actors = Actor.filter(Actor.id.in_(payload.actor_ids))

        for actor in actors:
            movie.actors.add(actor)

        movies_db.commit()
        return {"message": "OK"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to assign actors: {str(e)}")


@app.get("/movies/{movie_id}/actors")
async def get_actors_for_movie(movie_id: int) -> List[ActorSchema]:
    try:
        movie = Movie.get(movie_id)
        actors = movie.actors
        return [ActorSchema.from_orm(actor) for actor in actors]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get actors: {str(e)}")
