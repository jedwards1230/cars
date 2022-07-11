import React, { useContext } from "react"
import { Col, Container, ListGroup, Row } from "react-bootstrap"
import { AppContext } from "../context";

const GenerationEntries = (props: any) => {
	const appContext = useContext(AppContext);
    
    return (
        <Container>
				<ListGroup>
					{appContext.activeConfig.generations.map((gen: Generation, i: number) => {
						return (
							<ListGroup.Item key={i} className="text-center">
								<Row>
									<Col>
										Generation: {gen.id + 1}
									</Col>
									<Col>
										Distance: {gen.distance}
									</Col>
									<Col>
										Cars Passed: {gen.score}
									</Col>
								</Row>
							</ListGroup.Item>
                        )
					})}
				</ListGroup>
			</Container>
    )
}

export default GenerationEntries;