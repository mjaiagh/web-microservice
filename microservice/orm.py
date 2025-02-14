# type: ignore

from peewee import SqliteDatabase,Model,CharField, IntegerField,ManyToManyField, ForeignKeyField

db: SqliteDatabase = SqliteDatabase('movies.db')

class BaseMovie(Model):
  
    class Meta:
        database = db

class Actor(BaseMovie):
    name:CharField = CharField()
    surname:CharField = CharField()
    class Meta: # type: ignore
        table_name = 'actor'
    
class Movie(BaseMovie):
    title:CharField = CharField()
    year:IntegerField = IntegerField()
    actors:ManyToManyField = ManyToManyField(Actor, backref='movies')
    class Meta: # type: ignore
        table_name = 'movies'
        
class ActorMovie(BaseMovie):
    actor:ForeignKeyField = ForeignKeyField(Actor)
    movie:ForeignKeyField = ForeignKeyField(Movie)
    class Meta: # type: ignore
        table_name = 'movie_actor_through'
        
class MoviesDB:
    def __init__(self):
        if db.is_closed():
            db.connect()
        db.create_tables([Actor, Movie,ActorMovie]) 
        self.movies: list[Movie] = list(Movie.select()) 
        self.actors: list[Actor] = list(Actor.select())
        
    def get_movies(self) -> list[Movie]:
        return self.movies
    
    def get_actors(self) -> list[Actor]:
        return self.actors
    
    def commit(self) -> list[Actor]:
        db.session_commit()
        self.movies: list[Movie] = list(Movie.select()) 
        self.actors: list[Actor] = list(Actor.select())