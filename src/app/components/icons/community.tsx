interface Props {
  color?: string
}

export const Community = ({}: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        className="fill-default-900"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.81658 8.09274C8.81658 8.47701 8.50641 8.78889 8.12423 8.78889C7.74204 8.78889 7.43187 8.47701 7.43187 8.09274C7.43187 5.55968 9.48125 3.5 12.0005 3.5C14.5188 3.5 16.5682 5.55968 16.5682 8.09274C16.5682 10.6258 14.5188 12.6855 12.0005 12.6855C10.9694 12.6855 9.99728 12.3523 9.19046 11.7211C8.88859 11.4853 8.83412 11.0481 9.0686 10.7446C9.30216 10.4402 9.7388 10.3863 10.0407 10.623C10.6019 11.0611 11.2795 11.2932 12.0005 11.2932C13.7563 11.2932 15.1835 9.85725 15.1835 8.09274C15.1835 6.32823 13.7563 4.8923 12.0005 4.8923C10.2447 4.8923 8.81658 6.32823 8.81658 8.09274ZM7.0207 10.9852C7.0207 11.3695 6.71052 11.6813 6.32834 11.6813C4.33527 11.6813 2.71331 10.0514 2.71331 8.04744C2.71331 6.04346 4.33527 4.41261 6.32834 4.41261C6.71052 4.41261 7.0207 4.72448 7.0207 5.10876C7.0207 5.49303 6.71052 5.80491 6.32834 5.80491C5.09871 5.80491 4.09803 6.81108 4.09803 8.04744C4.09803 9.28381 5.09871 10.289 6.32834 10.289C6.71052 10.289 7.0207 10.6009 7.0207 10.9852ZM5.03114 14.872C4.58618 14.9017 4.13938 14.9676 3.70273 15.066C3.03253 15.1988 2.57188 15.4252 2.4528 15.6759C2.36325 15.8661 2.36325 16.0861 2.4528 16.2764C2.51003 16.3961 2.74267 16.6941 3.69073 16.8899C4.06553 16.967 4.30647 17.3346 4.22985 17.7114C4.16338 18.0409 3.87444 18.2674 3.55226 18.2674C3.50611 18.2674 3.45995 18.2628 3.41287 18.2535C2.26725 18.0177 1.52412 17.5536 1.20286 16.8742C0.93238 16.3033 0.93238 15.6489 1.20286 15.0781C1.52781 14.3922 2.27278 13.929 3.41748 13.7025C3.90583 13.593 4.42371 13.5178 4.9379 13.4835C5.30716 13.4547 5.64965 13.7471 5.67549 14.1304C5.70134 14.5147 5.41332 14.847 5.03114 14.872ZM17.6833 10.3117C17.3011 10.3117 16.9909 10.6236 16.9909 11.0078C16.9909 11.3921 17.3011 11.704 17.6833 11.704C19.6717 11.704 21.29 10.0769 21.29 8.07752C21.29 6.07724 19.6717 4.45103 17.6833 4.45103C17.3011 4.45103 16.9909 4.76198 16.9909 5.14719C16.9909 5.53146 17.3011 5.84334 17.6833 5.84334C18.9083 5.84334 19.9053 6.84579 19.9053 8.07752C19.9053 9.30924 18.9083 10.3117 17.6833 10.3117ZM20.6028 13.7196C21.73 13.9442 22.4731 14.4055 22.7971 15.0878C23.0676 15.6586 23.0676 16.312 22.7971 16.8829C22.4768 17.5596 21.7355 18.0227 20.5917 18.2594C20.5456 18.2696 20.4985 18.2743 20.4514 18.2743C20.1302 18.2743 19.8422 18.0469 19.7748 17.7183C19.6981 17.3414 19.9391 16.9729 20.3139 16.8959C21.2583 16.7 21.4909 16.403 21.5472 16.2842C21.6367 16.0949 21.6367 15.8767 21.5472 15.6874C21.429 15.4377 20.9702 15.2121 20.3185 15.0822C19.8652 14.9819 19.4184 14.916 18.9772 14.8863C18.595 14.8613 18.307 14.528 18.3328 14.1447C18.3577 13.7614 18.691 13.4773 19.0695 13.4977C19.5818 13.5321 20.0969 13.6073 20.6028 13.7196ZM12.0002 14.126C10.333 14.126 5.26036 14.126 5.26036 17.3218C5.26036 18.0431 5.54284 19.0418 6.88878 19.7055C7.30235 19.9078 7.80269 20.073 8.37689 20.1965C8.74892 20.28 9.11817 20.0368 9.19757 19.6609C9.27788 19.285 9.03878 18.9146 8.66491 18.8348C8.20149 18.7355 7.80823 18.6074 7.49806 18.4542C6.742 18.082 6.64507 17.6541 6.64507 17.3218C6.64507 15.8311 9.55759 15.5183 12.0002 15.5183C15.5543 15.5183 17.3554 16.1189 17.3554 17.3051C17.3554 18.7949 14.4429 19.1077 12.0002 19.1077C11.618 19.1077 11.3079 19.4196 11.3079 19.8038C11.3079 20.1881 11.618 20.5 12.0002 20.5C13.6674 20.5 18.7401 20.5 18.7401 17.3051C18.7401 14.126 13.8438 14.126 12.0002 14.126Z"
        fill="#200E32"
      />
    </svg>
  )
}
