import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { RailRoad_Ticket_ABI, RailRoad_Ticket_ADDRESS, RailRoad_Card_ABI, RailRoad_Card_ADDRESS } from '../config'

function Admin() {
  //définition des variables (getter, setter)
  const [isAdminCard, setIsAdminCard] = useState();
  const [isAdminTicket, setIsAdminTicket] = useState();

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
    //récupération du booléen qui définit si vous êtes admin
    const adminCard = await RailRoadCard.admins(signerAddress);
    const adminTicket = await RailRoadTicket.admins(signerAddress);

    //sauvegarde des valeurs dans les variables
    setIsAdminCard(adminCard);
    setIsAdminTicket(adminTicket);
  }

  async function CreateCard(e) {
    //récupération des valeurs données dans la balise <Form>
    e.preventDefault();
    const data = new FormData(e.target);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const RailRoadCard = new ethers.Contract(RailRoad_Card_ADDRESS, RailRoad_Card_ABI, signer);

    try {
      //appelle de la méthode pour ajouter une carte, à partir des valeurs du form
      const transaction = await RailRoadCard.addDiscountCard(data.get("cardName"), data.get("cardDiscountPercent"), data.get("cardPrice"), data.get("cardDescription"), data.get("cardUrl"));

      //quand la transaction est terminé on réappelle la méthode getData()
      await transaction.wait();
      getData();
      //on avertie l'utilisateur du bon déroulement de l'opération
      alert("la carte a bien était créer");
    }
    catch (err) {
      console.log(err);
      alert(err);
    }

  }

  //ticketUse permet l'utilisation de ticket
  async function ticketUse(e) {
    //récupération des valeurs données dans la balise <Form>
    e.preventDefault();
    const data = new FormData(e.target);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const RailRoadTicket = new ethers.Contract(RailRoad_Ticket_ADDRESS, RailRoad_Ticket_ABI, signer);

    try {
      //appelle de la méthode du contrat qui permet l'utilisation de ticket
      const transaction = await RailRoadTicket.ticket_use(data.get("amount"), data.get("address"));

      //quand la transaction est terminé on appelle la méthode refreshPage()
      await transaction.wait();
      //on avertie l'utilisateur du bon déroulement de l'opération
      alert("les tickets ont bien été utiliser");
    }
    catch (err) {
      console.log(err);
      alert(err);
    }

  }

  //rendu HTML
  if(isAdminCard || isAdminTicket) {
    return (
      <div>
        {isAdminTicket &&
          <div className="container-fluid">
            <div className="row">
              <main role="main" className="col-lg-12 d-flex justify-content-center">
                <div id="content">
                  <form onSubmit={ticketUse}>
                    Voulez vous utiliser des tickets :
                    <div className="my-3">
                      <input
                        type="number"
                        name="amount"
                        className="input input-bordered block w-full focus:ring focus:outline-none"
                        placeholder="Nombre de tickets"
                      />
                    </div>
                    <div className="my-3">
                      <input
                        type="text"
                        name="address"
                        className="input input-bordered block w-full focus:ring focus:outline-none"
                        placeholder="adresse de l'utilisateur"
                      />
                    </div>
                    <footer className="p-4">
                      <button
                        type="submit"
                        className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                      >
                        utiliser ticket
                      </button>
                    </footer>
                  </form>
                </div>
              </main>
            </div>
          </div>
        }
        {isAdminCard &&
          <div className="container-fluid">
            <div className="row">
              <main role="main" className="col-lg-12 d-flex justify-content-center">
                <div id="content">
                  <form onSubmit={CreateCard}>
                    Création de nouvelle carte de réduction :
                    <div className="my-3">
                      <input
                        type="text"
                        name="cardName"
                        className="input input-bordered block w-full focus:ring focus:outline-none"
                        placeholder="Nom de la carte"
                      />
                    </div>
                    <div className="my-3">
                      <input
                        type="number"
                        name="cardDiscountPercent"
                        className="input input-bordered block w-full focus:ring focus:outline-none"
                        placeholder="pourcentage de réduction"
                      />
                    </div>
                    <div className="my-3">
                      <input
                        type="number"
                        name="cardPrice"
                        className="input input-bordered block w-full focus:ring focus:outline-none"
                        placeholder="prix de la carte"
                      />
                    </div>
                    <div className="my-3">
                      <input
                        type="text"
                        name="cardDescription"
                        className="input input-bordered block w-full focus:ring focus:outline-none"
                        placeholder="Description de la carte"
                      />
                    </div>
                    <div className="my-3">
                      <input
                        type="text"
                        name="cardUrl"
                        className="input input-bordered block w-full focus:ring focus:outline-none"
                        placeholder="Url de l'image de la carte"
                      />
                    </div>
                    <footer className="p-4">
                      <button
                        type="submit"
                        className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                      >
                        Créer la carte
                      </button>
                    </footer>
                  </form>
                </div>
              </main>
            </div>
          </div>
        }
      </div>
    );
  } 
  else {
    return (
      <div>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              <div id="content">
                <h1>Vous n'êtes pas Admin</h1>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

}

export default Admin;