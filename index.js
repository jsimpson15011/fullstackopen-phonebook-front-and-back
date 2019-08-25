require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Person = require('./models/person')
const cors = require('cors')
app.use(express.static('build'))
app.use(cors())
app.use(bodyParser.json())

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.find({"_id": id})
    .then(person => {
      if (person && person.length !== 0) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, {new: true})
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (body === undefined) {
    return res.status(400).json({error: 'content missing'})
  }

  if (!body.name) {
    return res.status(400).json({
      error: 'name missing'
    })
  }
  if (!body.number) {
    return res.status(400).json({
      error: 'number missing'
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  Person.find({}).then(people => {
    const phoneBookMessage =
      `<p>Phonebook has info for ${people.length} people</p>
        <p>${new Date()}</p>
        `

    res.send(phoneBookMessage)
  })
})
const errorHanlder = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}
app.use(errorHanlder)

const PORT = process.env.PORT
app.listen(PORT)
