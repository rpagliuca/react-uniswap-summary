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
    window.location.hash = endpoint;
    setEndpoint(endpoint)
  }
  
  let hashEndpoint = window.location.hash.substr(1);

  const activateHashChangeHandler = () => {

    if (!("onhashchange" in window)) {
      return () => {};
    }

    const handler = () => {
      hashEndpoint = window.location.hash.substr(1);
      loadHashFromURL();
    }

    window.onhashchange = handler;

    // Callback to deactivate the current handler
    return () => {
      window.onhashchange = null;
    }

  };

  const loadHashFromURL = () => {
    persistEndpoint(hashEndpoint)
  };

  const loadHashFromCookie = () => {
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
  }

  useEffect(() => {

    // Load from URL
    loadHashFromURL();

    // Load from cookie
    loadHashFromCookie();

    const deactivateHashChangeHandler = activateHashChangeHandler()

    return () => {
      deactivateHashChangeHandler()
    }

  });

  if (!endpoint) {
    return <Setup setEndpoint={persistEndpoint}/>;
  }

  return (
    <>
    <rs.Form>
      <rs.FormGroup>
        <center><rs.Button onClick={() => persistEndpoint("")}>Clear current session</rs.Button></center>
      </rs.FormGroup>
    </rs.Form>
    <Stats endpoint={endpoint}/>
    </>
  )

}
function Setup({setEndpoint}) {

  const [text, setText] = useState("");

  const onSubmit = () => {
    setEndpoint(text)
  }

  return (
    <rs.Form onSubmit={onSubmit}>
      <rs.FormGroup>
        <rs.Label>Enter the endpoint of your own deploy of <a href="https://github.com/rpagliuca/serverless-uniswap-summary">serverless-uniswap-summary</a>:</rs.Label>
        <rs.Input onChange={(e) => setText(e.target.value)} value={text}/>
      </rs.FormGroup>
      <rs.Button>Go!</rs.Button>
    </rs.Form>
  )
}

function Stats({handleClear, endpoint}) {

  const [data, setData] = useState({"isLoading": true, "shouldLoad": true});

  useEffect(() => {
    setData({"isLoading": true});
    fetch(endpoint)
      .then(response => response.json().then(data => setData(data)))
      .catch((error) => setData({"error": error.toString()}))
  }, [endpoint]);

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

    <rs.Row>

        {data.map(i => {

          idx += 1;

          const positionType = i.Token.Token1InitialQuantity < 0 ? "position-negative" : "position-positive";

          return (

            <rs.Col md="6">

            <rs.Card key={idx} className={positionType}>
              <rs.CardBody>

                <rs.CardTitle tag="h5"><rs.Badge color="warning">{i.Token.Pair.Id}</rs.Badge></rs.CardTitle>

                <rs.Badge color="dark">Initial position @ {i.Token.InitialDate.replace("T", " ").replace("Z", " UTC")}</rs.Badge>

                <rs.Card className="internal-card">
                  <rs.CardBody>

                    <rs.Row><rs.Col>
                        <b>{i.Token.Token1.Id}:</b> {i.Token.Token1InitialQuantity.toFixed(3)}
                    </rs.Col></rs.Row>

                    <rs.Row><rs.Col>
                        <b>{i.Token.Token2.Id}:</b> {i.Token.Token2InitialQuantity.toFixed(3)}
                    </rs.Col></rs.Row>

                    <rs.Row><rs.Col>
                        <b>K:</b> {i.InitialK.toFixed(3)}
                    </rs.Col></rs.Row>

                    <rs.Row><rs.Col>
                        <b>Initial price:</b> {i.InitialPrice.toFixed(3)} {i.Token.Token1.Id}/{i.Token.Token2.Id}
                    </rs.Col></rs.Row>

                  </rs.CardBody>
                </rs.Card>

                <rs.Badge color="dark">Current position</rs.Badge>

                <rs.Card className="internal-card">
                  <rs.CardBody>

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
                        <b>End price:</b> {i.FinalPrice.toFixed(3)} {i.Token.Token1.Id}/{i.Token.Token2.Id}
                    </rs.Col></rs.Row>

                  </rs.CardBody>

                </rs.Card>

                <rs.Badge color="dark">Results</rs.Badge>
                <rs.Card className="internal-card">
                  <rs.CardBody>
                    <rs.Row><rs.Col>
                        <b>Divergence loss:</b> {i.DivergenceLoss.toFixed(2)}%
                    </rs.Col></rs.Row>

                    <rs.Row><rs.Col>
                        <b>Fees:</b> {i.PercentageFees.toFixed(2)}%
                    </rs.Col></rs.Row>

                    <rs.Row><rs.Col>
                        <b>Current profit:</b> {i.AccruedProfit.toFixed(2)}%
                    </rs.Col></rs.Row>

                    <rs.Row><rs.Col>
                        <b>Yearly profit rate:</b> {i.YearlyProfit.toFixed(2)}%
                    </rs.Col></rs.Row>

                  </rs.CardBody>
                </rs.Card>






              </rs.CardBody>
            </rs.Card>
            </rs.Col>

        )})}

    </rs.Row>
  );
}

export default App;
