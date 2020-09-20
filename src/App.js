import React, { useState, useEffect } from "react"
import { geoEqualEarth, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsonData from "./data.json";
const projection = geoEqualEarth()
  .scale(160)
  .translate([ 850 / 2, 550 / 2 ])
function App() {
  const [geographies, setGeographies] = useState([]);
  const [citie, setCities] = useState([]);
  const [counter, setCounter] = useState(0);
  const [calculate, setCalc] = useState([0]);
  const [percent, setPercent] = useState([0]);
  let calc = [0,0,0,0]
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
          if(citie[i].usage<500&citie[i].usage>=0){ calc[0]++;setCalc(calc)}
          if(citie[i].usage>=500&&citie[i].usage<1000) { calc[1]++;setCalc(calc) }
          if(citie[i].usage>=1000&&citie[i].usage<5000) { calc[2]++;setCalc(calc) }
          if(citie[i].usage>=5000) { calc[3]++;setCalc(calc) }
        }
        for(let i=0;i<calculate.length;i++){
          if(counter<4){
            calc[i] = (calc[i]/citie.length)*100;
            setCounter(counter => counter + 1);
            setCalc(calc);
          }
        }
        setPercent(calculate);
  }, [citie,counter])
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
  function fill(usage){
    if(usage<500) return "#99f3bd";
    if(usage>=500&&usage<1000) return "#28df99";
    if(usage>=1000&&usage<5000) return "#68b0ab";
    if(usage>=5000) return "#006a71";
  }
  function radius(usage){
    if(usage<500&usage>=0) return 5;
    if(usage>=500&&usage<1000) return 8;
    if(usage>=1000&&usage<5000) return 10;
    if(usage>=5000) return 13;
  }
  return (
    <div>
      <ToastContainer draggable={false} autoClose ={2000}/>
      {counter > 0 &&  geographies.length > 0 ? <svg width={ "900px" } height={ "450px" }>
          <g>
            {
              geographies.map((d,i) => (
                <path
                  key={ `path-${ i }` }
                  d={ geoPath().projection(projection)(d) }
                  className="country"
                  fill  = "#eee"
                  stroke="black"
                  strokeWidth={ 0.5 }
                />
              ))
            }
          </g>
            <g>
            {
                citie.map((city, i) => (
                  <circle
                    key={ `marker-${i}` }
                    cx={ projection(city.coordinates)[0] }
                    cy={ projection(city.coordinates)[1] }
                    r={ radius(city.usage) }
                    fill={fill(city.usage)}
                   onClick={ () => handleMarkerClick(i) }
                  />
                ))
              }
            </g>
              {(percent[0]&&percent[1]&&percent[2]&&percent[3]) ? <g>
                <rect width={calculate[3]*50} height={10} fill="#006a71" />
                <text x="0" y="40" fontFamily="Verdana" fontSize="15" fill="blue">Usage :</text>
              <text x="60" y="40" fontFamily="Verdana" fontSize="15" fill="blue"> > 5K {Math.ceil(percent[3])}%</text>
                <rect width={calculate[2]*50} height={10} fill="#68b0ab" x={calculate[3]*50}  />
                <text x={calculate[3]*50 +25} y="40" fontFamily="Verdana" fontSize="15" fill="blue" > 1K-5K  {Math.ceil(percent[2])}%</text>
                <rect width={calculate[1]*50} height={10} fill="#28df99" x={(calculate[3]*50)+(calculate[2]*50)} />
                <text x={(calculate[3]*50)+(calculate[2]*50)} y="40" fontFamily="Verdana" fontSize="15" fill="blue" > 1K-500  {Math.ceil(percent[1])}%</text>
                <rect width={calculate[0]*50} height={10} fill="#99f3bd" x={(calculate[3]*50)+(calculate[2]*50)+(calculate[1]*50)}/>
                <text x={(calculate[3]*50)+(calculate[2]*50)+(calculate[1]*50)} y="40" fontFamily="Verdana" fontSize="15" fill="blue" > {'<'} 500 {Math.ceil(percent[0])} %</text>
            </g> 
            : <g><rect width={900} height={10} fill="red"/></g>
            }
      </svg> : <p>Loading.....</p>}
    </div>
  );
}

export default App;
