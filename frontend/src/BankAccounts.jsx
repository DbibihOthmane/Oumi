import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { fetchBankAccounts, updateBankAccount, createCompte, deleteBankAccount } from './api';
import { Pencil, Trash } from 'react-bootstrap-icons';

export function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateAccount, setUpdateAccount] = useState(null);
  const [newAccount, setNewAccount] = useState({
    dateCreation: '',
    solde: '',
    type: 'Courant',
  });
  const [isCreateOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const data = await fetchBankAccounts();
      setAccounts(data);
    } catch (err) {
      setError('Failed to fetch bank accounts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBankAccount(id);
      fetchAccounts();
    } catch (err) {
      setError('Failed to delete the account. Please try again.');
    }
  };

  const handleUpdate = async (format) => {
    try {
      const { id, ...accountData } = updateAccount;
      accountData.dateCreation = formatDateString(accountData.dateCreation);

      await updateBankAccount(id, accountData, format);
      setUpdateAccount(null);
      fetchAccounts();
    } catch (err) {
      setError('Failed to update the account. Please try again.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      newAccount.dateCreation = formatDateString(newAccount.dateCreation);
      await createCompte(newAccount);
      resetNewAccount();
      setCreateOpen(false);
      fetchAccounts();
    } catch (err) {
      setError('Failed to create the account. Please try again.');
    }
  };

  const formatDateString = (dateString) => {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
  };

  const resetNewAccount = () => {
    setNewAccount({ dateCreation: '', solde: '', type: 'Courant' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date)
      ? 'Invalid Date'
      : date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  };

  const formatSolde = (solde) => {
    return solde ? solde.toFixed(2) : '0.00';
  };

  return (
    <Container fluid className="py-5 bg-light">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Body>
              <h1 className="mb-4 text-primary">Comptes Bancaires</h1>
              <p className="text-muted mb-4">Liste de tous vos comptes bancaires</p>
              <Button onClick={() => setCreateOpen(true)} variant="outline-primary" className="mb-4">
                <i className="bi bi-plus-circle me-2"></i>Ajouter un Compte
              </Button>

              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Table responsive hover className="align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>Date de Création</th>
                      <th>Solde</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id}>
                        <td>{formatDate(account.dateCreation)}</td>
                        <td>{formatSolde(account.solde)} MAD</td>
                        <td>
                          <span className={`badge bg-${account.type === 'Courant' ? 'info' : 'success'}`}>
                            {account.type}
                          </span>
                        </td>
                        <td>
                          <Button onClick={() => setUpdateAccount(account)} variant="outline-warning" size="sm" className="me-2">
                            <Pencil />
                          </Button>
                          <Button onClick={() => handleDelete(account.id)} variant="outline-danger" size="sm">
                            <Trash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {error && <Alert variant="danger">{error}</Alert>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <CreateAccountModal
        show={isCreateOpen}
        onHide={() => setCreateOpen(false)}
        newAccount={newAccount}
        setNewAccount={setNewAccount}
        handleCreate={handleCreate}
      />

      <UpdateAccountModal
        show={updateAccount !== null}
        onHide={() => setUpdateAccount(null)}
        updateAccount={updateAccount}
        setUpdateAccount={setUpdateAccount}
        handleUpdate={handleUpdate}
      />
    </Container>
  );
}

function CreateAccountModal({ show, onHide, newAccount, setNewAccount, handleCreate }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Ajouter un Nouveau Compte</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleCreate}>
          <Form.Group className="mb-3" controlId="dateCreation">
            <Form.Label>Date de création</Form.Label>
            <Form.Control
              type="date"
              value={newAccount.dateCreation}
              onChange={(e) => setNewAccount({ ...newAccount, dateCreation: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="solde">
            <Form.Label>Solde</Form.Label>
            <Form.Control
              type="number"
              value={newAccount.solde || ''}
              onChange={(e) => setNewAccount({ ...newAccount, solde: parseFloat(e.target.value) })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="type">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={newAccount.type}
              onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
            >
              <option value="Courant">Courant</option>
              <option value="Epargne">Epargne</option>
            </Form.Select>
          </Form.Group>
          <div className="d-grid">
            <Button type="submit" variant="primary">
              Créer
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

function UpdateAccountModal({ show, onHide, updateAccount, setUpdateAccount, handleUpdate }) {
  if (!updateAccount) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title>Modifier le Compte</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => {
          e.preventDefault();
          handleUpdate(document.getElementById('responseFormat').value);
        }}>
          <Form.Group className="mb-3" controlId="dateCreation">
            <Form.Label>Date de création</Form.Label>
            <Form.Control
              type="date"
              value={updateAccount.dateCreation || ''}
              onChange={(e) => setUpdateAccount({ ...updateAccount, dateCreation: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="solde">
            <Form.Label>Solde</Form.Label>
            <Form.Control
              type="number"
              value={updateAccount.solde.toFixed(2) || ''}
              onChange={(e) => setUpdateAccount({ ...updateAccount, solde: parseFloat(e.target.value) })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="type">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={updateAccount.type || ''}
              onChange={(e) => setUpdateAccount({ ...updateAccount, type: e.target.value })}
            >
              <option value="Courant">Courant</option>
              <option value="Epargne">Epargne</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="responseFormat">
            <Form.Label>Format de réponse</Form.Label>
            <Form.Select defaultValue="xml">
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button type="submit" variant="warning" className="me-2">
              Mettre à jour
            </Button>
            <Button variant="secondary" onClick={onHide}>
              Annuler
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

