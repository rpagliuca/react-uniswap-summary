import * as rs from 'reactstrap';

import React, { useEffect, useState } from 'react';

function App() {
  return (
    <rs.Container>
      <Main/>
    </rs.Container>
  );
}

function Main() {

  const [endpoint, setEndpoint] = useState("");

  const persistEndpoint = (endpoint) => {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = "endpoint=" + endpoint + "; SameSite=Strict; Max-Age=" + oneYear;
    setEndpoint(endpoint)
  }

  useEffect(() => {
    let cookieValue = "";
    try {
      cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('endpoint='))
        .split('=')[1];
    } catch {}
    if (cookieValue) {
      setEndpoint(cookieValue);
    }
  }, [endpoint]);

  if (!endpoint) {
    return <Setup setEndpoint={persistEndpoint}/>;
  }

  return (
    <>
    <rs.Form>
      <rs.FormGroup>
        <center><rs.Button onClick={() => persistEndpoint("")}>Back</rs.Button></center>
      </rs.FormGroup>
    </rs.Form>
    <Stats endpoint={endpoint}/>
    </>
  )

}
function Setup({setEndpoint}) {

  const [text, setText] = useState("");

  return (
    <rs.Form>
      <rs.FormGroup>
        <rs.Label>Enter the endpoint of your own deploy of <a href="https://github.com/rpagliuca/serverless-uniswap-summary">serverless-uniswap-summary</a>:</rs.Label>
        <rs.Input onChange={(e) => setText(e.target.value)} value={text}/>
      </rs.FormGroup>
      <rs.Button onClick={() => setEndpoint(text)}>Go!</rs.Button>
    </rs.Form>
  )
}

function Stats({handleClear, endpoint}) {

  const [data, setData] = useState({"isLoading": true, "shouldLoad": true});

  useEffect(() => {
    if (data.shouldLoad) {
      data.shouldLoad = false;
      setData(data);
      fetch(endpoint)
        .then(response => response.json().then(data => setData(data)))
        .catch((error) => setData({"error": error.toString()}))
    }
  }, [endpoint, data]);

  if (data.isLoading) {
    return (
      <div>Loading data...</div>
    );
  }

  if (data.error) {
    return (
      <div>{data.error}</div>
    );
  }

  let idx = 0;

  return (
    <rs.Container>
      <rs.Row>

        {data.map(i => {

          idx += 1;

          return (

          <rs.Col key={idx}>

            <rs.Card>
              <rs.CardBody>

                <rs.CardTitle tag="h5">{i.Token.Pair.Id}</rs.CardTitle>

                <rs.Row><rs.Col>
                    <b>{i.Token.Token1.Id}:</b> {i.Token1FinalQuantity.toFixed(3)}
                </rs.Col></rs.Row>

                <rs.Row><rs.Col>
                    <b>{i.Token.Token2.Id}:</b> {i.Token2FinalQuantity.toFixed(3)}
                </rs.Col></rs.Row>

                <rs.Row><rs.Col>
                    <b>K:</b> {i.MyK.toFixed(3)}
                </rs.Col></rs.Row>

                <rs.Row><rs.Col>
                    <b>Initial price:</b> {i.InitialPrice.toFixed(3)} {i.Token.Token1.Id}/{i.Token.Token2.Id}
                </rs.Col></rs.Row>

                <rs.Row><rs.Col>
                    <b>End price:</b> {i.FinalPrice.toFixed(3)}
                </rs.Col></rs.Row>

                <rs.Row><rs.Col>
                    <b>Divergence loss (%):</b> {i.DivergenceLoss.toFixed(2)}
                </rs.Col></rs.Row>

                <rs.Row><rs.Col>
                    <b>Fees (%):</b> {i.PercentageFees.toFixed(2)}
                </rs.Col></rs.Row>

                <rs.Row><rs.Col>
                    <b>Accrued profit (%):</b> {i.AccruedProfit.toFixed(2)}
                </rs.Col></rs.Row>

                <rs.Row><rs.Col>
                    <b>Yearly profit rate (%):</b> {i.YearlyProfit.toFixed(2)}
                </rs.Col></rs.Row>



              </rs.CardBody>
            </rs.Card>

          </rs.Col>
        )})}
        

      </rs.Row>

    </rs.Container>
  );
}

export default App;
