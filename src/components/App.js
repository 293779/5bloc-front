import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../App.css'
import { RailRoad_Ticket_ABI, RailRoad_Ticket_ADDRESS, RailRoad_Card_ABI, RailRoad_Card_ADDRESS } from '../config'

function App() {
  //définition des variables (getter, setter)
  const [address, setAdress] = useState();
  const [tickets, settTicket] = useState();
  const [ticketPrice, settTicketPrice] = useState();
  const [bestDiscountPercent, setBestDiscountPercent] = useState();

  //a la fin du chargement de la page on appelle la méthode getData()
  useEffect(() => {
    getData();
  }, [])

  //getData() permet de récupérer les variables issues du contrat et l'adresse de l'utilisateur
  async function getData() {
    //mise en place du provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    //récupération des contrats
    const RailRoadTicket = new ethers.Contract(RailRoad_Ticket_ADDRESS, RailRoad_Ticket_ABI, provider);
    const RailRoadCard = new ethers.Contract(RailRoad_Card_ADDRESS, RailRoad_Card_ABI, provider);
    //récupération de l'utilisateur
    const signer = await provider.getSigner();
    //récupération de l'adresse de l'utilisateur
    const signerAddress = await signer.getAddress();
    //récupération du nombre de tickets de l'utilisateur, du prix du tickets et de la réduction qui sera aplliqué
    const nbrOfTickets = await RailRoadTicket.tickets(signerAddress);
    const Ticket_price = await RailRoadTicket.ticket_price();
    const DiscountPercent = await RailRoadCard.getBiggestReduct(signerAddress);

    //sauvegarde des valeurs dans les variables
    setAdress(signerAddress);
    settTicket(String(nbrOfTickets));
    settTicketPrice(String(Ticket_price));
    setBestDiscountPercent(String(DiscountPercent));
  }

  //TicketBuy permet de réaliser l'achat de tickets
  async function TicketBuy(e) {
    //récupération des valeurs données dans la balise <Form>
    e.preventDefault();
    const data = new FormData(e.target);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const RailRoadTicket = new ethers.Contract(RailRoad_Ticket_ADDRESS, RailRoad_Ticket_ABI, signer);

    try {
      //utilisation de la méthode de calcul du prix total
      const finalPrice = await RailRoadTicket.calculate_ticket_price(data.get("nbrOfTicketToBuy"));

      //appelle de la méthode du contrat qui permet l'achat de tickets
      const transaction = await RailRoadTicket.ticket_buy(data.get("nbrOfTicketToBuy"), { value: finalPrice });

      //quand la transaction est terminé on réappelle la méthode getData()
      await transaction.wait();
      getData();
    }
    catch (err) {
      console.log(err);
      alert(err);
    }

  }

  //rendu HTML
  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex justify-content-center">
            <div id="content">
              <p>Votre adresse : {address}</p>
              <p>nombre de ticket : {tickets}</p>
              <p>prix pour 1 ticket : {ticketPrice} WEI</p>
              <p>pourcentage de réduction appliqué (meilleur) : {bestDiscountPercent} %</p>

              <form onSubmit={TicketBuy}>
                Voulez vous acheter des tickets :
                <div className="my-3">
                  <input
                    type="text"
                    name="nbrOfTicketToBuy"
                    className="input input-bordered block w-full focus:ring focus:outline-none"
                    placeholder="Nombre de ticket"
                  />
                </div>
                <footer className="p-4">
                  <button
                    type="submit"
                    className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                  >
                    Acheter ticket(s)
                  </button>
                </footer>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );

}

export default App;