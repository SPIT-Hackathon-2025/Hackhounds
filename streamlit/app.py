# streamlit_app.py
import streamlit as st
import streamlit.components.v1 as components

# Define a title for the app
st.title("Streamlit App with Custom React Component")

# Text to explain functionality
st.write("Below is a custom React button that changes color when you click it.")

# Load the React component
# The width and height parameters can be set as needed
components.html(
    """
    <div id="root"></div>
    <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    
    <script type="text/babel">
      // React component to render a button with color-changing functionality
      class ColorButton extends React.Component {
        constructor(props) {
          super(props);
          this.state = { color: 'blue' };
        }

        changeColor = () => {
          this.setState({
            color: this.state.color === 'blue' ? 'green' : 'blue'
          });
        };

        render() {
          return (
            <button
              style={{
                backgroundColor: this.state.color,
                color: 'white',
                padding: '10px 20px',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={this.changeColor}
            >
              Click me to change color!
            </button>
          );
        }
      }

      ReactDOM.render(<ColorButton />, document.getElementById('root'));
    </script>
    """,
    height=200,
)
