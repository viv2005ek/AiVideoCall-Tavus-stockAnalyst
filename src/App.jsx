import { useState, useEffect } from "react";
import {
  Container,
  Button,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const API_KEY = "API KEY";
const REPLICA_ID = "rcda3332ad7b";
const PERSONA_ID = "p742791b42e5";
const API_BASE_URL = "https://tavusapi.com/v2";

export default function VideoChatApp() {
  const [conversation, setConversation] = useState(null);
  const [replica, setReplica] = useState(null);
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [callStatus, setCallStatus] = useState("disconnected");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const replicaRes = await fetch(
          `${API_BASE_URL}/replicas/${REPLICA_ID}`,
          {
            method: "GET",
            headers: { "x-api-key": API_KEY },
          }
        );
        const replicaData = await replicaRes.json();
        setReplica(replicaData);

        const personaRes = await fetch(
          `${API_BASE_URL}/personas/${PERSONA_ID}`,
          {
            method: "GET",
            headers: { "x-api-key": API_KEY },
          }
        );
        const personaData = await personaRes.json();
        setPersona(personaData);
      } catch (err) {
        setError("Failed to fetch initial data");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const startConversation = async () => {
    setLoading(true);
    setError(null);
    setCallStatus("connecting");

    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          replica_id: REPLICA_ID,
          persona_id: PERSONA_ID,
          callback_url: `${window.location.origin}/webhook`,
          conversation_name: "Live Conversation",
          conversational_context:
            "You are having a real-time video conversation.",
          custom_greeting: "Hello! How can I help you today?",
          properties: {
            max_call_duration: 3600,
            participant_left_timeout: 60,
            participant_absent_timeout: 300,
            enable_recording: false,
            enable_closed_captions: true,
            apply_greenscreen: false,
            language: "english",
          },
        }),
      });

      const data = await response.json();
      setConversation(data);
      setCallStatus("active");
      console.log("Conversation URL:", data.conversation_url);
    } catch (err) {
      setError("Failed to start conversation: " + err.message);
      setCallStatus("disconnected");
      console.error("Conversation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const endConversation = () => {
    setConversation(null);
    setCallStatus("ended");
    setTimeout(() => setCallStatus("disconnected"), 2000);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-info text-white">
              <h2 className="mb-0">🎥 Tavus AI Video Chat</h2>
            </Card.Header>

            <Card.Body className="text-center">
              {error && <Alert variant="danger">{error}</Alert>}

              {replica && persona && (
                <div className="mb-3">
                  <h5>
                    <Badge bg="primary" className="me-2">
                      Replica:
                    </Badge>
                    {replica.name}
                  </h5>
                  <h6>
                    <Badge bg="secondary" className="me-2">
                      Persona:
                    </Badge>
                    {persona.name}
                  </h6>
                </div>
              )}

              {callStatus === "disconnected" ? (
                <Button
                  variant="success"
                  size="lg"
                  onClick={startConversation}
                  disabled={loading || !replica || !persona}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" />
                      <span className="ms-2">Preparing...</span>
                    </>
                  ) : (
                    "Start Video Call"
                  )}
                </Button>
              ) : (
                <>
                  <div className="video-container mb-4">
                    {callStatus === "active" && conversation ? (
                      <>
                        <h5>🔴 Live Conversation</h5>
                        <div className="ratio ratio-16x9">
                          <iframe
                            src={conversation.conversation_url}
                            title="Tavus Video Call"
                            allow="camera; microphone"
                            style={{
                              border: "none",
                              borderRadius: "12px",
                              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="py-5">
                        <Spinner animation="border" variant="info" />
                        <p className="text-muted mt-2">
                          Connecting to video call...
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="danger"
                    size="lg"
                    onClick={endConversation}
                    disabled={callStatus === "ended"}
                  >
                    {callStatus === "ended" ? "Call Ended" : "End Call"}
                  </Button>
                </>
              )}

              <div className="mt-3">
                <span className="text-muted">Status: </span>
                <strong
                  className={
                    callStatus === "active"
                      ? "text-success"
                      : callStatus === "connecting"
                      ? "text-warning"
                      : "text-secondary"
                  }
                >
                  {callStatus.charAt(0).toUpperCase() + callStatus.slice(1)}
                </strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
