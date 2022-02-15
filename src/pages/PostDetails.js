import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Navbar } from '../components/navbar/Navbar';
import { PostAnswers } from '../components/postAnswers/PostAnswers';
import { PostInfo } from '../components/postInfo/PostInfo';
import {TextEditor} from '../components/textEditor/TextEditor';
import { useAuthorization } from '../hooks/useAuthorization';
import { AsidePostsInfo } from '../components/AsidePostsInfo/AsidePostsInfo';
const { REACT_APP_API_URL } = process.env;

export const PostDetails = () => {
    const { userSession, userProfile } = useAuthorization();
    const { id } = useParams();
    const [ isLoading, setIsLoading ] = useState(true);
    const [ postInfo, setPostInfo ] = useState();
    const [ newAnswer, setNewAnswer ] = useState('');
    const [ postedAnswer, setPostedAnswer ] = useState( new Date().toLocaleString() );

    useEffect(() => {
        async function getPostData() {
            try{
                const post = await axios.get(`${REACT_APP_API_URL}/api/v1/posts/${id}`);
                setPostInfo(post?.data);
                setIsLoading(false);
                await axios.put(`${REACT_APP_API_URL}/api/v1/posts/${id}/view`);
            }catch( error ){
                console.log(error);
            }
        }
        getPostData();
    }, [id]);

    const handleSubmit = async () => {
      await axios(
        {
            method: 'POST',
            url: `${REACT_APP_API_URL}/api/v1/posts/${id}/answers`,
            headers: {'Authorization': `Bearer ${userSession}`},
            data: {
              content: newAnswer,
            },
        });
        setPostedAnswer( new Date().toLocaleString() );
    }
    if( isLoading ) return <div>Loading</div>;

  const mostRecentPosts = 'search?searchBy=date&direction=desc&order=date&limit=5';
  const mostLikedPosts = 'search?searchBy=titles&direction=desc&order=likes&limit=5';
  const mostAnsweredPosts = 'search?searchBy=numAnswers&order=numAnswers&numAnswers=0';
  const mostViewedPosts = 'search?&searchBy=content&orderBy=views';
  return (
    <>
      <ContentWrapper>
        <StyledNavbar />
        <AsideWrapper>
          <AsidePostsInfo url={mostRecentPosts}>
            Recent posts
          </AsidePostsInfo>
          <AsidePostsInfo url={mostLikedPosts}>
            Top rated posts
          </AsidePostsInfo>
        </AsideWrapper>
        <GridWrapper>
          <PostInfo post={postInfo} />
          {
            postInfo?.technology.id === userProfile?.userData?.technologies
            ?
            <TextEditor value={newAnswer} setValue={setNewAnswer} submit={ handleSubmit } />
            : <div id='disallowed-reply'>
                <p>Debes ser experto en esta tecnología para responder a esa pregunta.</p>
            </div>
          }
          <PostAnswers key={postedAnswer} post={postInfo} />
        </GridWrapper>
        <AsideWrapper>
          <AsidePostsInfo url={mostAnsweredPosts}>
            Most answered posts
          </AsidePostsInfo>
          <AsidePostsInfo url={mostViewedPosts}>
            Most viewed posts
          </AsidePostsInfo>
        </AsideWrapper>
      </ContentWrapper>
    </>
  );
};

const AsideWrapper = styled.div`
  display: none;
  position: sticky;
  top: 0;

  @media (min-width: 768px) {
    flex: 0 1 20%;
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    justify-content: center;
    height: 80vh;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  flex-flow: wrap;
  min-width: 100%;
  max-width: 100%;
  margin: 0 auto;
`;
const GridWrapper = styled.div`
  flex: 0 1 92%;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: center;

  & > * {
    flex: 0 1 100%;
  }

  & > div#disallowed-reply {
    flex: 0 1 100%;
    border: 1px solid black;
    padding: 0.5em;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 1);
    box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    p {
      text-align: center;
      font-style: italic;
      font-size: 1em;
      padding: 0.2em;
      :after{
        content: '👩‍🏫';
        font-style: normal;
      }
    }
  }
}

  @media (min-width: 768px) {
    flex: 0 1 60%;
    & > * {
      flex: 0 1 88%;
    }
    & > div#disallowed-reply {
      flex: 0 1 90%;
    }

  }
`;
const StyledNavbar = styled(Navbar)`
  flex: 0 0 100%;
`;

