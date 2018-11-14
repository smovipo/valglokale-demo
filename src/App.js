import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';

// The topmost component, all information will be passed down from here
class App extends Component {

  constructor() {

    super();

    this.state = {
      error: null,
      isLoaded: false,
      counties: [],
      municipalities: [],
      votingAreas: [],
      setCounty: "Velg fylke",
      setMunicipality: "Velg kommune",
      isMunicipalityDisabled: true
    };
  }

  // Following standard React guidelines for doing initial API calls
  componentDidMount() {
    // Fetching all counties in Norway
    fetch("https://hotell.difi.no/api/json/difi/geo/fylke")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            counties: result.entries
          });
        },
        // Not handling error in a catch-block as it could swallow exceptions
        // from the component itself
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  // Creates MenuItem-components from array-elements
  createCountyDropdownMenuElements(counties) {
    return counties.map((county) => (
      <MenuItem
        key={county.nummer}
        eventKey={county.nummer}
        onClick={() => {
          this.setState({
            setCounty: county.navn,
            setMunicipality: "Velg kommune",
            isMunicipalityDisabled: false
          });
          this.getMunicipalities(county.nummer);
        }}
      >
        {county.navn}
      </MenuItem>
    ));
  }

  createMuncipialityDropdownMenuElements(municipalities) {
    return municipalities.map((municipality) => (
      <MenuItem
        key={municipality.kommune}
        eventKey={municipality.kommune}
        onClick={() => {
          this.setState({setMunicipality: municipality.navn});
          this.getVotingPlaces(municipality.kommune);
        }}
      >
        {municipality.navn}
      </MenuItem>
    ))
  }

  // Retrieves the municipalities from the selected county
  getMunicipalities(countyNumber) {
    fetch(`https://hotell.difi.no/api/json/difi/geo/kommune?fylke=${countyNumber}`)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            municipalities: result.entries
          });
        }
      )
  }

  // Finding all voting places in the selected municipality
  // NOTE: Not solved how to go through the pages when there are more than one
  getVotingPlaces(municipalityNumber) {
    // Need to remove an eventual leading 0
    const parsedMunicipalityNumber = parseInt(municipalityNumber, 10);


    // TODO: Solve how to move to the next page
    fetch(`https://hotell.difi.no/api/json/valg/valglokaler/2017?page=${1}&municipality_id=${parsedMunicipalityNumber}`)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          console.log(result.pages);

          // Add the new results at the end
          // NOTE: Commented line for when multiple pages can be accessed
          // NOTE: When accessing multiple pages, MAKE SURE that votinAreas votinAreas
          // cleared when the user selects another county and municipality
          this.setState({
            // votingAreas: [...this.state.votingAreas, result.entries]
            votingAreas: result.entries
          });
        }
      )
  }

  // Creating the table-instances for the different voting places
  createTableElements(places) {
    return places.map((place) => (
      <tr>
        <td>{place.polling_place_name}</td>
        <td>{place.address_line}</td>
        <td>{place.postal_code}</td>
        <td>{place.area}</td>
        <td>{place.info_text}</td>
        <td>{place.election_day_voting === "1" ? "Ja" : "Nei"}</td>
        <td>{place.opening_hours}</td>
      </tr>
    ));
  }


  render() {
    const { error, isLoaded, counties, municipalities, votingAreas } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>
    }
    else if (!isLoaded) {
      return <div>Loading...</div>
    }
    else {
      return (
        <div>
          <DropdownButton
            title={this.state.setCounty}
            id={'county-dropdown'}
          >
            {this.createCountyDropdownMenuElements(counties)}
          </DropdownButton>
          <DropdownButton
            title={this.state.setMunicipality}
            id={'municipality-dropdown'}
            disabled={this.state.isMunicipalityDisabled}
          >
            {this.createMuncipialityDropdownMenuElements(municipalities)}
          </DropdownButton>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Navn på valglokale</th>
                <th>Addresse</th>
                <th>Postkode</th>
                <th>Poststed</th>
                <th>Info om stedet</th>
                <th>Åpent på valgdagen</th>
                <th>Åpningstider</th>
              </tr>
            </thead>
            <tbody>
              {this.createTableElements(votingAreas)}
            </tbody>
          </Table>
        </div>
      );
    }
  }
}

export default App;
