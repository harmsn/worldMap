import React, { useState, useEffect } from "react"
import { geoEqualEarth, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsonData from "./data.json";
const projection = geoEqualEarth()
  .scale(180)
  .translate([ 850 / 2, 550 / 2 ])
function App() {
  const [geographies, setGeographies] = useState([]);
  const [citie, setCities] = useState([]);
  useEffect(() => {
    fetch("/world-110m.json")
      .then(response => {
        if (response.status !== 200) {
          console.log(`There was a problem: ${response.status}`)
          return
        }
        response.json().then(worlddata => {
          setGeographies(feature(worlddata, worlddata.objects.countries).features)
        })
      })
        setCities(jsonData);
        for(let i=0;i<citie.length;i++){
          console.log(citie[i].net);
        }
  }, [citie])
  const handleMarkerClick = i => {
    getCity(citie[i].coordinates[0] , citie[i].coordinates[1]).then(x => { 
      toast.success(`${x} data usage is ${citie[i].usage}`) 
    })
  }
  async function getCity(long,lat){
    let api = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`;
    const apiResponse = await fetch(api).then(res => res.json())
    return apiResponse.principalSubdivision;
  }
  function opacity(usage){
    if(usage<500&usage>=0) return 0.36;
    if(usage>=500&&usage<1000) return 0.45;
    if(usage>=1000&&usage<5000) return 0.65;
    if(usage>=5000) return 0.7;
  }
  function radius(usage){
    if(usage<500&usage>=0) return 5;
    if(usage>=500&&usage<1000) return 8;
    if(usage>=1000&&usage<5000) return 10;
    if(usage>=5000) return 13;
  }
  return (
    <div className="App">
      <ToastContainer draggable={false} autoClose ={2000}/>
      {geographies.length > 0 ? <svg width={ "900px" } height={ "450px" }>
          <g className="countries">
            {
              geographies.map((d,i) => (
                <path
                  key={ `path-${ i }` }
                  d={ geoPath().projection(projection)(d) }
                  className="country"
                  fill={ `rgba(38,50,56,${ 1 / geographies.length * i})` }
                  stroke="#FFFFFF"
                  strokeWidth={ 0.5 }
                />
              ))
            }
          </g>
            <g className="markers">
            {
                citie.map((city, i) => (
                  <circle
                    key={ `marker-${i}` }
                    cx={ projection(city.coordinates)[0] }
                    cy={ projection(city.coordinates)[1] }
                    r={ radius(city.usage) }
                    style={{opacity : opacity(city.usage)}}
                    fill="blue"
                    stroke="#FFFFFF"
                    className="marker"
                   onClick={ () => handleMarkerClick(i) }
                  />
                ))
              }
            </g> 
      </svg> : <p>Loading.....</p>}
    </div>
  );
}

export default App;
