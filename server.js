

// Importeer het npm pakket express uit de node_modules map
import express, { response } from 'express'

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// Stel het basis endpoint in
const apiUrl = 'https://fdnd.directus.app/items'

// Haal alle squads uit de WHOIS API op
const squadData = await fetchJson(apiUrl + '/squad')

const messages = []

// Maak een nieuwe express app aan
const app = express()

// Stel ejs in als template engine
app.set('view engine', 'ejs')

// Stel de map met ejs templates in
app.set('views', './views')

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static('public'))

//zorg dat werken met request data makkelijker wordt 
app.use(express.urlencoded({ extended: true }))

//Maak een GET route voor de index 
app.get('/', function (request, response) {
  //Haal alle personen uit de WHOIS API op
  fetchJson('https://fdnd.directus.app/items/person').then((apiData) => {
    //apiData bevat gegevens van alle personen uit alle squads 
    //Je zou dat hier kunnen filteren, sorteren of zelfs aanpassen, voordat je deze verstuurd naar de view

    //Render index.js uit de views map en geef de opgehaalde data mee als variabele, genaamd person. Geef ook de message mee als variabele 
    response.render('index', {
      persons: apiData.data,
      squads: squadData.data,
      messages: messages
    })
  })
})

//Maak een POST route voor de index 
app.post('/', function (request, response) {
  //Voeg het nieuwe bericht toe an de messges array 
  messages.push(request.body.bericht)
  //Redirect hierna naar GET op / 
  response.redirect(303, '/')
})


app.get('/squad/:id', async function (request, response) {
  const squadId = request.params.id;
  const sort = request.query.sort;

  const squadData = await fetchJson(apiUrl + '/squad/' + squadId);

  let personDataUrl = apiUrl + '/person?filter={"squad_id":' + squadId + '}';
  if (sort) {
    personDataUrl += `&sort=${sort}`;
  }

  const personData = await fetchJson(personDataUrl);
  response.render('squad', { persons: personData.data, squad: squadData.data });
});

// Maak een GET route voor een detailpagina met een request parameter id
app.get('/person/:id', function (request, response) {
  // Gebruik de request parameter id en haal de juiste persoon uit de WHOIS API op
  fetchJson(apiUrl + '/person/' + request.params.id).then((apiData) => {
    // Render person.ejs uit de views map en geef de opgehaalde data mee als variable, genaamd person
    response.render('person', { person: apiData.data, squad: squadData.data, messages: messages })
  })
})



// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})
