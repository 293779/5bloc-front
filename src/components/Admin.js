import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { RailRoad_Ticket_ABI, RailRoad_Ticket_ADDRESS, RailRoad_Card_ABI, RailRoad_Card_ADDRESS } from '../config'

function Admin() {

  const [isAdmin, setIsAdmin] = useState();

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
    const admin = await RailRoadCard.admins(signerAddress);

    //sauvegarde des valeurs dans les variables
    setIsAdmin(admin);
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
      const transaction = await RailRoadCard.addDiscountCard(data.get("cardName"), data.get("cardDiscountPercent"), data.get("cardPrice"), data.get("cardDescription"), data.get("cardUrl"));

      await transaction.wait();
      getData();
      alert("la carte a bien était créer");
    }
    catch (err) {
      console.log(err);
      alert(err);
    }

  }

  //rendu HTML
  if(isAdmin) {
    return (
      <div>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              <div id="content">
                <h1>Admin</h1>
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