const database = require('./database')
const { ApolloServer, gql } = require('apollo-server')
/**
 * Query 루트 타입
 * 자료 요청에 사용될 쿼리들을 정의
 * 쿼리 명령문마다 반환될 데이터 형태를 지정
 * 
 * 이 예제에서는 teams 쿼리를 보내면 Team 타입의 배열을 반환함
 * 
 * Type 정의
 * Team 타입은 어떤 데이터를 반환할지 정의
 * 자료형을 가진 필드들로 구성
 */
const typeDefs = gql`
  type Query {
    teams: [Team]
    team(id: Int): Team
    equipments: [Equipment]
    supplies: [Supply]
  }
  type Team {
    id: Int
    manager: String
    office: String
    extension_number: String
    mascot: String
    cleaning_duty: String
    project: String
    supplies: [Supply]
  }
  type Equipment {
    id: String
    used_by: String
    count: Int
    new_or_used: String
  }
  type Supply {
    id: String
    team: Int
  }
`

/**
 * Resolver 정의
 * 쿼리로서 진행하는 작업들이 실질적으로 이루어지는 코드들이 들어감
 * 
 * 예제에서는 teams 쿼리에 대한 resolver를 정의
 * database의 teams을 반환
 */
const resolvers = {
  Query: {
    // team에 supplies 연결해서 team에 해당하는 supplies 반환
    teams: () => database.teams
    .map((team) => {
      team.supplies = database.supplies
      .filter((supply) => {
        return supply.team === team.id
      })
      return team
    }),
    // 특정 id를 받아 해당 id에 맞는 팀 정보 반환
    team: (parent, args, context, info) => database.teams
    .filter((team) => {
      return team.id === args.id
    })[0],
    equipments: () => database.equipments,
    supplies: () => database.supplies
  }
}
// ApolloServer => typeDefs, resolvers를 받아 서버 생성
const server = new ApolloServer({ typeDefs, resolvers })
/**
 * typeDef: GraphQL 명세에서 사용될 데이터, 요청의 타입(스키마) 지정
 * gql(template literal tag)로 생성됨.
 * 
 * resolver: typeDef에 정의된 데이터를 처리하는 함수
 * 서비스의 액션들을 함수로 지정
 * 요청에 따라 데이터를 반환, 입력, 수정, 삭제함
 * 
 * GraphQL Playground
 * 작성한 GraphQL type, resolver 명세 확인
 * 데이터 요청 및 전송 테스트
 */
server.listen().then(({ url }) => {
console.log(`🚀  Server ready at ${url}`)
})