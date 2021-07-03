const PORT = process.env.PORT || 3001
const BASE_URL = '/api/persons'

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

morgan.token('reqBody',(req,res)=> JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'))

const generateId = () => Math.floor(Math.random()*Number.MAX_SAFE_INTEGER) 

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov ",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]

app.get(BASE_URL,(request,reponse)=>{
  reponse.json(persons)
})

app.get('/info',(request,reponse)=>{
  const info = `<p>Phonebook has infor for ${persons.length} people</p>
  <p>${new Date}</p>` 

  reponse.send(info)
})

app.get(`${BASE_URL}/:id`,(request,response)=>{
  const id = Number(request.params.id)
  
  const person = persons.find(person=>person.id === id)

  if(person)
  {
    response.json(person)
  }
  else{
    response.status(404).end()
  }
})

app.delete(`${BASE_URL}/:id`,(request,response)=>{
  const id = Number(request.params.id)
  persons = persons.filter(person=>person.id !== id)

  response.status(204).end()

})

app.post(BASE_URL,(request,response)=>{
  const body = request.body
  const errors = validateRequest(body)

  if (errors) {
    return response.status(400).json({ 
      error: errors 
    })
  }

  const person = {
    name: body.name,
    number: body.number ,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)

})

const validateRequest = (requestBody) => 
{
  const errorMessage = []
  const hasName = requestBody.name
  const hasNumber = requestBody.number

  if(!hasName)
  {
    errorMessage.push('name must be specified')
  }
  if(!hasNumber)
  {
    errorMessage.push('number must be specified')
  }
  if(hasName && hasNumber && persons.find(person => person.name === requestBody.name))
  {
    errorMessage.push('name must be unique')
  }

  return errorMessage.join(';')
}

app.listen(PORT,()=>
{
  console.log(`server running on port ${PORT}`);
})

