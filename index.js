require('dotenv').config()

const Person = require('./models/person')

const PORT = process.env.PORT || 3001
const BASE_URL = '/api/persons'

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('reqBody', (req, res) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'))

app.get(BASE_URL, (request, reponse, next) => {
  Person.find({}).then(persons => {
    reponse.json(persons)
  })
  .catch(error=>{
    next(error)
  })
})

app.get('/info', (request, reponse, next) => {
  Person.countDocuments({})
  .then(result => {

    const info = `<p>Phonebook has infor for ${result} people</p>
    <p>${new Date}</p>`

    reponse.send(info)
  })
  .catch(error=>{
    next(error)
  })
})

app.get(`${BASE_URL}/:id`, (request, response, next) => {

  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    }
    else {
      response.status(404).end()
    }
  })
  .catch(error => {
    next(error)
  })

})

app.put(`${BASE_URL}/:id`, (request, response, next) => {

  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {new:true, runValidators: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error=>{
      next(error)
    })
})

app.delete(`${BASE_URL}/:id`, (request, response, next) => {

  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
  .catch(error=>{
    next(error)
  })

})

app.post(BASE_URL, (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
  .then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error=>{
    next(error)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if(error.name === 'ValidationError'){
    return response.status(400).send({ error: error.message})
  } 

  next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
})

