import React, { Component } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

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
  getVotingPlaces(municipalityNumber) {
    // Need to remove an eventual leading 0
    const parsedMunicipalityNumber = parseInt(municipalityNumber, 10);

    console.log(parsedMunicipalityNumber);

    fetch(`https://hotell.difi.no/api/json/valg/valglokaler/2017?municipality_id=${parsedMunicipalityNumber}`)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          this.setState({
            votingAreas: result.entries
          });
        }
      )
  }



  render() {
    const { error, isLoaded, counties, municipalities } = this.state;

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
        </div>
      );
    }
  }
}

export default App;
